import express from 'express';
import * as dotenv from 'dotenv';
import fs from "node:fs";
import axios from "axios";
import FormData from "form-data";

dotenv.config();

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello from DALL-E!');
});

router.post('/', async (req, res) => {
    try {
        const { prompt } = req.body;

        const payload = {
            prompt: prompt,
            output_format: "webp"
        }

        const response = await axios.postForm(
            `https://api.stability.ai/v2beta/stable-image/generate/core`,
            axios.toFormData(payload, new FormData()),
            {
                validateStatus: undefined,
                responseType: "arraybuffer",
                headers: {
                    Authorization: `Bearer ${process.env.DREAMDIFFUSION_API_KEY}`,
                    Accept: "image/*"
                },
            },
        );

        if (response.status === 200) {
            fs.writeFileSync("./public/image.webp", Buffer.from(response.data));
        } else {
            throw new Error(`${response.status}: ${response.data.toString()}`);
        }

        const base64Image = `data:image/webp;base64,${Buffer.from(response.data).toString("base64")}`;

        res.status(200).json({ photo: base64Image });
    } catch (error) {
        console.error(error);
        res.status(500).send(error?.message || 'Something went wrong');
    }
});

export default router;
