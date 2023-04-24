// imports
import express from "express";
import Video from "../models/video";
import { requireSelf } from "../middleware/authentication";
import { checkUserExists } from "../middleware/checkResourceExists";

// express router
const router = express.Router();

/**
 * @put
 *      PUT request to like a video post
 */
router.put("/likeVideo", requireSelf, checkUserExists, async (req, res) => {
    // destructure
    const { userId, videoKey } = req.body;

    try {
        // add userId to video likes array field in db
        const preUpdatedDocument = await Video.findOneAndUpdate(
            { videoKey },
            { $addToSet: { likes: userId } },
            { new: false }
        );

        // if video not found
        if (!preUpdatedDocument) {
            return res.status(400).json({
                success: false,
                error: "Video not found",
            });
        }

        // if userId was already in likes array
        if (preUpdatedDocument.likes.includes(userId)) {
            return res.status(400).json({
                success: false,
                likesCount: preUpdatedDocument.likes.length,
                error: "Invalid Feedback Operation Error: failed to like video post. reason: video was already liked",
            });
        }

        // return response
        res.status(200).json({
            success: true,
            likesCount: preUpdatedDocument.likes.length + 1,
        });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({
            success: false,
            error: err.message,
        });
    }
});

/**
 * @put
 *      PUT request to remove like from a video post
 */
router.put("/unlikeVideo", requireSelf, checkUserExists, async (req, res) => {
    // destructure
    const { userId, videoKey } = req.body;

    try {
        // remove userId from video likes array field in db
        const preUpdatedDocument = await Video.findOneAndUpdate(
            { videoKey },
            { $pull: { likes: userId } },
            { new: false }
        );

        // if video not found
        if (!preUpdatedDocument) {
            return res.status(400).json({
                success: false,
                error: "Video not found",
            });
        }

        // if userId was not in likes array
        if (!preUpdatedDocument.likes.includes(userId)) {
            return res.status(400).json({
                success: false,
                likesCount: preUpdatedDocument.likes.length,
                error: "Invalid Feedback Operation Error: failed to unlike video post. reason: video post was not liked",
            });
        }

        // return response
        res.status(200).json({
            success: true,
            likesCount: preUpdatedDocument.likes.length - 1,
        });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({
            success: false,
            error: err.message,
        });
    }
});

// export router
export default router;