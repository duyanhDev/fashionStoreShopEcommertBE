const Users = require("../Model/User");
const Message = require("../Model/Message");

// Helper function to create and save a message
const createMessage = async (
  sender,
  recipient,
  content,
  image,
  isAdminChat
) => {
  const message = new Message({
    sender,
    recipient,
    content,
    image,
    isAdminChat, // Mark message source (admin or customer)
  });

  // Save and return the message
  const savedMessage = await message.save();
  return savedMessage;
};

// Gửi tin nhắn từ admin đến khách hàng
const sendMessageToCustomer = async (sender, recipient, content, image) => {
  // Validate message content
  if (!content || content.trim() === "") {
    throw new Error("Message content cannot be empty");
  }

  // Check if recipient (customer) is provided when admin sends a message
  if (!recipient) {
    throw new Error(
      "Recipient (customer) is required when admin sends a message"
    );
  }

  // Create the message and return the saved message
  return createMessage(sender, recipient, content, image, true);
};

// Gửi tin nhắn từ khách hàng đến admin
const sendMessageToAdmin = async (sender, content, image) => {
  console.log("sendMessageToAdmin: sender is Customer, recipient is Admin");

  // Validate message content
  if (!content || content.trim() === "") {
    throw new Error("Message content cannot be empty");
  }

  // Find all admin users
  const recipients = await Users.find({ isAdmin: true }, { _id: 1 });

  if (recipients.length === 0) {
    throw new Error("No admin users found");
  }

  // Create messages for all admins and save them
  const messages = recipients.map((admin) =>
    createMessage(sender, admin._id, content, image, false)
  );

  // Save all messages and return the saved messages
  const savedMessages = await Promise.all(messages);
  return savedMessages;
};

module.exports = {
  sendMessageToCustomer,
  sendMessageToAdmin,
};
