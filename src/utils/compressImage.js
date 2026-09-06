const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

const isHeicLike = (file) => {
    const type = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    return type.includes('heic') || type.includes('heif') || /\.hei[cf]$/i.test(name);
};

export const compressImageFile = async (file) => {
    if (!(file instanceof File) || isHeicLike(file)) {
        return file;
    }

    const looksLikeImage = (file.type || '').startsWith('image/') || /\.(jpe?g|png|gif|webp)$/i.test(file.name || '');
    if (!looksLikeImage) {
        return file;
    }

    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
        });
        if (!blob) return file;

        const compressed = new File(
            [blob],
            (file.name || 'photo').replace(/\.[^.]+$/, '.jpg'),
            { type: 'image/jpeg' }
        );

        return compressed.size <= file.size || file.size > 4 * 1024 * 1024
            ? compressed
            : file;
    } catch (error) {
        console.warn('Could not compress image, using original file:', file.name, error);
        return file;
    }
};
