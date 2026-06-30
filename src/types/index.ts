
export type LinkType = "primary" | "secondary" | "ghost";

export interface Link {
  id: string;
  label: string;
  url: string;
  type: LinkType;
  order: number;
  clicks: number;
  active: boolean;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  username: string;
  name: string;
  role: string;
  bio: string;
  accent: string;
  avatar: string;
  userId: string;
  links: Link[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  profile: Profile | null;
}

// API response shapes
export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Drag-and-drop reorder payload
export interface ReorderPayload {
  orderedIds: string[]; // link IDs in new order
}

// Profile update payload
export type ProfileUpdatePayload = Partial<
  Pick<Profile, "name" | "role" | "bio" | "accent" | "avatar">
>;

// Link create/update payload
export type LinkCreatePayload = Pick<Link, "label" | "url" | "type">;
export type LinkUpdatePayload = Partial<Pick<Link, "label" | "url" | "type" | "active">>;