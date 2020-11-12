// @ts-nocheck
import { getStructureById } from "../structure.service";
import { getStructureFromDB } from "../structure.repository";

const structure = { id: "id" };

jest.mock("../structure.repository.ts", () => ({
  getStructureFromDB: jest.fn().mockResolvedValue({ id: "id" }),
}));

type MockResponse = { json: any; status: any };
const mockResponse = (): MockResponse => {
  const res: MockResponse = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("getStructureById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call getStructureFromDB with correct params and return result", async () => {
    const res = mockResponse();
    await getStructureById(
      { query: { id: "id", withDisposAssocies: true } },
      res
    );
    expect(getStructureFromDB).toHaveBeenCalledWith("id", true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ text: "Succès", data: structure });
  });

  it("should call getStructureFromDB with correct params and return result", async () => {
    const res = mockResponse();
    await getStructureById(
      { query: { id: "id", withDisposAssocies: false } },
      res
    );
    expect(getStructureFromDB).toHaveBeenCalledWith("id", false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ text: "Succès", data: structure });
  });

  it("should call getStructureFromDB with correct params and return result", async () => {
    const res = mockResponse();
    await getStructureById(
      { query: { id: "id", withDisposAssocies: null } },
      res
    );
    expect(getStructureFromDB).toHaveBeenCalledWith("id", false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ text: "Succès", data: structure });
  });

  it("should return 400 if no id in query", async () => {
    const res = mockResponse();
    await getStructureById({ query: {} }, res);
    expect(getStructureFromDB).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ text: "Requête invalide" });
  });

  it("should return 404 if no structure found", async () => {
    getStructureFromDB.mockResolvedValueOnce(null);
    const res = mockResponse();
    await getStructureById({ query: { id: "id" } }, res);
    expect(getStructureFromDB).toHaveBeenCalledWith("id", false);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ text: "Pas de résultat" });
  });

  it("should return 500 if getStructureFromDb throws", async () => {
    getStructureFromDB.mockRejectedValueOnce(new Error("error"));
    const res = mockResponse();
    await getStructureById({ query: { id: "id" } }, res);
    expect(getStructureFromDB).toHaveBeenCalledWith("id", false);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ text: "Erreur interne" });
  });
});
