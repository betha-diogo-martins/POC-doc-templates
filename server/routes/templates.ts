import { Router, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db";
import type {
  Template,
  TemplateType,
  CreateTemplatePayload,
  UpdateTemplatePayload,
} from "../models/template";

const COLLECTION = "templates";
const VALID_TYPES: TemplateType[] = ["header", "body", "footer"];

const router = Router();

/** GET /api/templates?type=header&databaseId=x&systemId=y */
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const filter: Record<string, string> = {};

    if (
      req.query.type &&
      VALID_TYPES.includes(req.query.type as TemplateType)
    ) {
      filter.type = req.query.type as string;
    }
    if (req.query.databaseId) {
      filter.databaseId = req.query.databaseId as string;
    }
    if (req.query.systemId) {
      filter.systemId = req.query.systemId as string;
    }

    const templates = await db
      .collection<Template>(COLLECTION)
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();

    res.json(templates);
  } catch (error) {
    console.error("[GET /api/templates]", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

/** GET /api/templates/:id */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const db = await getDb();
    const template = await db
      .collection<Template>(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.json(template);
  } catch (error) {
    console.error("[GET /api/templates/:id]", error);
    res.status(500).json({ error: "Failed to fetch template" });
  }
});

/** POST /api/templates */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { databaseId, systemId, name, type, definition } =
      req.body as CreateTemplatePayload;

    if (!databaseId || !systemId || !name || !type || !definition) {
      res
        .status(400)
        .json({
          error:
            "Missing required fields: databaseId, systemId, name, type, definition",
        });
      return;
    }
    if (!VALID_TYPES.includes(type)) {
      res
        .status(400)
        .json({
          error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
        });
      return;
    }

    const now = new Date();
    const doc: Omit<Template, "_id"> = {
      databaseId,
      systemId,
      name,
      type,
      definition,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    const result = await db
      .collection<Template>(COLLECTION)
      .insertOne(doc as Template);

    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    console.error("[POST /api/templates]", error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

/** PUT /api/templates/:id */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updates: UpdateTemplatePayload = {};
    const body = req.body as UpdateTemplatePayload;

    if (body.name !== undefined) updates.name = body.name;
    if (body.definition !== undefined) updates.definition = body.definition;
    if (body.type !== undefined) {
      if (!VALID_TYPES.includes(body.type)) {
        res
          .status(400)
          .json({
            error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
          });
        return;
      }
      updates.type = body.type;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }

    const db = await getDb();
    const result = await db
      .collection<Template>(COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after" },
      );

    if (!result) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    console.error("[PUT /api/templates/:id]", error);
    res.status(500).json({ error: "Failed to update template" });
  }
});

/** DELETE /api/templates/:id */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const db = await getDb();
    const result = await db
      .collection<Template>(COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error("[DELETE /api/templates/:id]", error);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

export default router;
