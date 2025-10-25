interface User {
  id: string;
  role: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  verificationStatus: string;
  idPhotoPath: string | null;
  selfiePath: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  isAdmin?: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: Date | null;
  orderId: string | null;
  senderId: string;
  receiverId: string | null;
  mediaType: string | null;
  mediaPath: string | null;
  conversationType: string;
  isRead: boolean | null;
  isAdminMessage?: boolean;
}
