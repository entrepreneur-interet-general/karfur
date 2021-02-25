import { Res } from "../../../types/interface";
import logger = require("../../../logger");
import Event from "../../../schema/schemaEvent";
import { asyncForEach } from "../../../libs/asyncForEach";
import { ObjectId } from "mongoose";
import { updateDispositifInDB } from "../../../controllers/dispositif/dispositif.repository";

interface AggregateEvent {
  _id: ObjectId;
  count: number;
}
export const populateNbVuesOnDispositifs = async (_: any, res: Res) => {
  try {
    const aggregateEvents: AggregateEvent[] = await Event.aggregate([
      {
        $match: {
          action: "readDispositif",
          label: "dispositifId",
          value: { $ne: null },
        },
      },
      { $group: { _id: "$value", count: { $sum: 1 } } },
    ]);

    let correctUpdate = 0;
    let errors: AggregateEvent[] = [];
    await asyncForEach(aggregateEvents, async (event) => {
      try {
        logger.info(
          `[populateNbVuesOnDispositifs] updating dispositif with id ${event._id}`
        );
        await updateDispositifInDB(event._id, { nbVues: event.count });
        correctUpdate = correctUpdate + 1;
        logger.info(
          `[populateNbVuesOnDispositifs] successfully updated dispositif with id ${event._id}`
        );
        return;
      } catch (error) {
        logger.error(
          `[populateNbVuesOnDispositifs] error while updating dispositif ${event._id}`,
          { error: error.message }
        );
        errors.push(event);
      }
    });

    res.status(200).json({
      nbCorrect: correctUpdate,
      nbTotal: aggregateEvents.length,
      errors,
    });
  } catch (error) {
    logger.error("[populateNbVuesOnDispositifs] error", {
      error: error.message,
    });
    res.status(500).json({ text: "KO" });
  }
};
