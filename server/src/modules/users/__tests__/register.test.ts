// @ts-nocheck
import { register } from "../register";
import { createUser } from "../users.repository";

jest.mock("../users.repository", () => ({
  createUser: jest.fn(),
}));

jest.mock("password-hash", () => ({
  __esModule: true, // this property makes it work
  default: { generate: () => "hashedPassword" },
}));

describe("register", () => {
  const userRole = { nom: "User", _id: "id_user" };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockDate = new Date(1466424490000);
  jest.spyOn(global, "Date").mockImplementation(() => mockDate);

  it("should throw if password too weak", async () => {
    const user = { username: "username", password: "password" };
    try {
      await register(user, userRole);
    } catch (error) {
      expect(error.message).toEqual("PASSWORD_TOO_WEAK");
      expect.assertions(1);
    }
  });

  it("should create user", async () => {
    const userToSave = {
      username: "username",
      password: "hashedPassword",
      roles: ["id_user"],
      status: "Actif",
      last_connected: mockDate,
    };
    const savedUser = { ...userToSave, getToken: () => "token" };
    createUser.mockResolvedValueOnce(savedUser);
    const user = { username: "username", password: "46gh!§ççà" };
    const res = await register(user, userRole);
    expect(createUser).toHaveBeenCalledWith(userToSave);
    expect(res).toEqual({ user: savedUser, token: "token" });
  });

  it("should throw internal if createUser throws", async () => {
    createUser.mockRejectedValueOnce(new Error("erreur"));
    const userToSave = {
      username: "username",
      password: "hashedPassword",
      roles: ["id_user"],
      status: "Actif",
      last_connected: mockDate,
    };
    const savedUser = { ...userToSave, getToken: () => "token" };
    createUser.mockResolvedValueOnce(savedUser);
    const user = { username: "username", password: "46gh!§ççà" };
    try {
      await register(user, userRole);
    } catch (error) {
      expect(createUser).toHaveBeenCalledWith(userToSave);
      expect(error.message).toEqual("INTERNAL");
      expect.assertions(2);
    }
  });
});
