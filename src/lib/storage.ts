export async function uploadProductImage(file: File) {
    // Mock image upload implementation for demonstration
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            resolve(URL.createObjectURL(file));
        }, 1000);
    });
}
