// ================== HANDLE IMAGE WRONG ORIENTATION ==============================
//EX: This function to fix image orientation in mobile when picking image capture in mobile device

export const getOrientation = (file, callback) => {
	const reader = new FileReader();

	reader.onload = (event) => {
		const view = new DataView(event.target.result);

		if (view.getUint16(0, false) !== 0xFFD8) return callback(-2);

		const length = view.byteLength;
		let offset = 2;

		while (offset < length) {
			const marker = view.getUint16(offset, false);
			offset += 2;

			if (marker === 0xFFE1) {
				const checkView = view.getUint32(offset += 2, false);
				if (checkView !== 0x45786966) {
					return callback(-1);
				}
				const little = view.getUint16(offset += 6, false) === 0x4949;
				offset += view.getUint32(offset + 4, little);
				const tags = view.getUint16(offset, little);
				offset += 2;

				for (let i = 0; i < tags; i += 1) {
					if (view.getUint16(offset + (i * 12), little) === 0x0112) {
						return callback(view.getUint16(offset + (i * 12) + 8, little));
					}
				}
			} else if ((marker && 0xFF00) !== 0xFF00) break;
			else offset += view.getUint16(offset, false);
		}
		return callback(-1);
	};

	reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
};

export function fixImageOrientation(file) {
	return new Promise((resolve) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				let orientation = 1;

				getOrientation(file, (orientationArgs) => {
					orientation = orientationArgs;
				});

				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');

				canvas.width = img.width;
				canvas.height = img.height;

				ctx.save();

				if (orientation > 1) {
					switch (orientation) {
						case 2:
							ctx.transform(-1, 0, 0, 1, img.width, 0);
							break;
						case 3:
							ctx.transform(-1, 0, 0, -1, img.width, img.height);
							break;
						case 4:
							ctx.transform(1, 0, 0, -1, 0, img.height);
							break;
						case 5:
							ctx.transform(0, 1, 1, 0, 0, 0);
							break;
						case 6:
							ctx.transform(0, 1, -1, 0, img.height, 0);
							break;
						case 7:
							ctx.transform(0, -1, -1, 0, img.height, img.width);
							break;
						case 8:
							ctx.transform(0, -1, 1, 0, 0, img.width);
							break;
						default:
							break;
					}
				}

				ctx.drawImage(img, 0, 0);
				ctx.restore();

				canvas.toBlob((blob) => {
					const fixedFile = new File([blob], file.name, {
						type: file.type,
						lastModified: file.lastModified,
					});

					resolve(fixedFile);
				}, file.type);
			};

			img.onerror = () => {
				console.log('Error loading image');
			};

			img.src = event.target.result;
		};
		reader.readAsDataURL(file);
	});
}

// USAGE: 
const fixedFile = await fixImageOrientation(file);