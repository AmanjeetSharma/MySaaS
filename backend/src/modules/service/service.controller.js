import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

import {
    createService,
} from './service.service.js';

export const createServiceController = asyncHandler(async (req, res) => {
    const data = await createService(
        req.user._id,
        req.body.organizationId,
        req.body
    )

    return res.status(201).json(
        new ApiResponse(
            201,
            data,
            "Service created successfully."
        )
    );
})