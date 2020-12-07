import { Structure, StructureDoc } from "../../schema/schemaStructure";
import { ObjectId } from "mongoose";
import logger = require("../../logger");
import { asyncForEach } from "../../libs/asyncForEach";

export const getStructureFromDB = async (
  id: ObjectId,
  withDispositifsAssocies: boolean,
  fields: "all" | Record<string, number>
): Promise<StructureDoc> => {
  if (withDispositifsAssocies) {
    if (fields === "all") {
      return await Structure.findOne({ _id: id }).populate(
        "dispositifsAssocies"
      );
    }
    return await Structure.findOne({ _id: id }, fields).populate(
      "dispositifsAssocies"
    );
  }
  if (fields === "all") {
    return await Structure.findOne({ _id: id });
  }
  return await Structure.findOne({ _id: id }, fields);
};

export const getStructuresFromDB = async () =>
  await Structure.find(
    { status: "Actif" },
    { nom: 1, acronyme: 1, picture: 1 }
  );

export const updateAssociatedDispositifsInStructure = async (
  dispositifId: ObjectId,
  structureId: ObjectId
) => {
  logger.info("[updateAssociatedDispositifsInStructure] updating", {
    dispositifId,
    structureId,
  });

  // we add if not the case the dispositif to the correct structure
  await Structure.findByIdAndUpdate(
    { _id: structureId },
    { $addToSet: { dispositifsAssocies: dispositifId } },
    // @ts-ignore
    { new: true },
    () => {}
  );

  const structureArrayWithDispoAssocie = await Structure.find({
    dispositifsAssocies: dispositifId,
  });

  // if one structure it is the correct one
  if (structureArrayWithDispoAssocie.length === 1) return;

  // if more than 1, we have to remove the dispo from the wrong structures
  await asyncForEach(structureArrayWithDispoAssocie, async (structure) => {
    if (structure._id.toString() === structureId.toString()) return;
    logger.info(
      "[updateAssociatedDispositifsInStructure] remove dispositif associe from structure",
      { structure: structure._id, dispositifId }
    );
    await Structure.findByIdAndUpdate(
      { _id: structure._id },
      { $pull: { dispositifsAssocies: dispositifId } },
      // @ts-ignore
      { new: true },
      () => {}
    );
    return;
  });

  logger.info(
    "[updateAssociatedDispositifsInStructure] successfully updated structures"
  );
  return;
};
