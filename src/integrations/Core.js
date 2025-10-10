export async function UploadFile({ file }) {
  // Simulate upload by creating a local object URL
  return new Promise((resolve) => {
    const file_url = URL.createObjectURL(file);
    resolve({ file_url });
  });
}
