// @ts-nocheck
import { updateRoleAndStructureOfResponsable } from "../users.service";
import { getUserById, updateUserInDB } from "../users.repository";
import { getRoleByName } from "../../../controllers/role/role.repository";

jest.mock("../../../controllers/role/role.repository", () => ({
  getRoleByName: jest.fn().mockResolvedValue({ _id: "hasStructureId" }),
}));

jest.mock("../users.repository", () => ({
  getUserById: jest.fn(),
  updateUserInDB: jest.fn(),
}));
jest.mock("../../../logger");

describe("updateRoleAndStructureOfResponsable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call getUserById getRoleByName and updateUserInDB when user has role already and user has no structures", async () => {
    getUserById.mockResolvedValue({
      _id: "userId",
      roles: ["hasStructureId", "otherRole"],
      structures: [],
    });
    await updateRoleAndStructureOfResponsable("userId", "structId");
    expect(getUserById).toHaveBeenCalledWith("userId", {
      roles: 1,
      structures: 1,
    });
    expect(getRoleByName).toHaveBeenCalledWith("hasStructure");
    expect(updateUserInDB).toHaveBeenCalledWith("userId", {
      roles: ["otherRole", "hasStructureId"],
      structures: ["structId"],
    });
  });

  it("should call getUserById getRoleByName and updateUserInDB when user has not role already", async () => {
    getUserById.mockResolvedValueOnce({
      _id: "userId",
      roles: ["role1"],
      structures: ["struct1"],
    });
    await updateRoleAndStructureOfResponsable("userId", "structId");
    expect(getUserById).toHaveBeenCalledWith("userId", {
      roles: 1,
      structures: 1,
    });
    expect(getRoleByName).toHaveBeenCalledWith("hasStructure");
    expect(updateUserInDB).toHaveBeenCalledWith("userId", {
      roles: ["role1", "hasStructureId"],
      structures: ["struct1", "structId"],
    });
  });

  it("should throw when getUserById throws", async () => {
    getUserById.mockRejectedValueOnce(new Error("error"));
    try {
      await updateRoleAndStructureOfResponsable("userId", "structId");
    } catch (error) {
      expect(getUserById).toHaveBeenCalledWith("userId", {
        roles: 1,
        structures: 1,
      });
      expect(error).toEqual(Error("error"));
    }
    expect.assertions(2);
  });

  it("should throw when getRoleByName throws", async () => {
    getRoleByName.mockRejectedValueOnce(new Error("error"));
    try {
      await updateRoleAndStructureOfResponsable("userId", "structId");
    } catch (error) {
      expect(getUserById).toHaveBeenCalledWith("userId", {
        roles: 1,
        structures: 1,
      });
      expect(getRoleByName).toHaveBeenCalledWith("hasStructure");

      expect(error).toEqual(Error("error"));
    }
    expect.assertions(3);
  });

  it("should throw when updateUserInDB throws", async () => {
    updateUserInDB.mockRejectedValueOnce(new Error("error"));
    getUserById.mockResolvedValueOnce({
      _id: "userId",
      roles: ["role1"],
      structures: [],
    });

    try {
      await updateRoleAndStructureOfResponsable("userId", "structId");
    } catch (error) {
      expect(getUserById).toHaveBeenCalledWith("userId", {
        roles: 1,
        structures: 1,
      });
      expect(getRoleByName).toHaveBeenCalledWith("hasStructure");
      expect(updateUserInDB).toHaveBeenCalledWith("userId", {
        roles: ["role1", "hasStructureId"],
        structures: ["structId"],
      });
      expect(error).toEqual(Error("error"));
    }
    expect.assertions(4);
  });

  it("should call getUserById getRoleByName and updateUserInDB when user has no role and no structures", async () => {
    getUserById.mockResolvedValueOnce({
      _id: "userId",
    });
    await updateRoleAndStructureOfResponsable("userId", "structId");
    expect(getUserById).toHaveBeenCalledWith("userId", {
      roles: 1,
      structures: 1,
    });
    expect(getRoleByName).toHaveBeenCalledWith("hasStructure");
    expect(updateUserInDB).toHaveBeenCalledWith("userId", {
      roles: ["hasStructureId"],
      structures: ["structId"],
    });
  });
});
