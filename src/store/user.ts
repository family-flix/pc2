import { UserCore } from "@/domains/user";

import { storage } from "./storage";
import { client } from "./request";

const { id, username, avatar, email, token } = storage.get("user");
export const user = new UserCore({
  id,
  username,
  email,
  avatar,
  token,
  client,
});
