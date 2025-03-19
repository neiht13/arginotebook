// // components/action.ts
// "use server";
// import { connectToDatabase } from "@/lib/mongodb";

// import { verifyCaptcha } from "@/lib/captcha";



// export const sendContact = async (data) => {
//   try {
//     const { name, email, phone, message, captchaToken, captchaAnswer } = data;

//     // Xác minh CAPTCHA
//     const isCaptchaValid = verifyCaptcha(captchaToken, captchaAnswer);
//     if (!isCaptchaValid) {
//       return {
//         success: false,
//         message: "Xác minh CAPTCHA không thành công. Vui lòng thử lại.",
//       };
//     }

//     // Kiểm tra đầy đủ thông tin
//     if (!name || !email || !phone || !message) {
//       return { success: false, message: "Vui lòng điền đầy đủ thông tin." };
//     }

//     // Lưu vào MongoDB
// 	const { db } = await connectToDatabase();
//     const collection = db.collection("contacts");

//     await collection.insertOne({
//       name,
//       email,
//       phone,
//       message,
//       createdAt: new Date(),
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error in sendContact action:", error);
//     return {
//       success: false,
//       message: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
//     };
//   }
// };
