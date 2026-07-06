import { Booking } from "./booking.model.js";

export const findBookingById = async (bookingId, populateFields) => {
    let query = Booking.findById(bookingId);
    if (populateFields) {
        query = query.populate(populateFields);
    }
    return await query;
};

export const findBookingsByFilter = async (filter, sortOptions) => {
    let query = Booking.find(filter);
    if (sortOptions) {
        query = query.sort(sortOptions);
    }
    return await query;
};

export const findBookingsByOrganization = async (filter, paginationOptions, sortOrder) => {
    const { page, limit, skip } = paginationOptions;
    return await Booking.find(filter)
        .populate("service", "name slug mode durationInMinutes price currency")
        .sort({ startTime: sortOrder })
        .skip(skip)
        .limit(limit);
};

export const findBookingsByService = async (filter, paginationOptions, sortOrder) => {
    const { page, limit, skip } = paginationOptions;
    return await Booking.find(filter)
        .populate("service", "name slug mode durationInMinutes price currency")
        .sort({ startTime: sortOrder })
        .skip(skip)
        .limit(limit);
};

export const countBookingsByFilter = async (filter) => {
    return await Booking.countDocuments(filter);
};

export const findOverlappingBooking = async (serviceId, startTime, endTime, excludeBookingId) => {
    const query = {
        service: serviceId,
        status: { $in: ["PENDING", "CONFIRMED"] },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return await Booking.findOne(query);
};

export const createBooking = async (bookingData) => {
    return await Booking.create(bookingData);
};

export const updateBooking = async (bookingId, updateData) => {
    return await Booking.findByIdAndUpdate(
        bookingId,
        updateData,
        { new: true, runValidators: true }
    );
};

export const deleteBookingById = async (bookingId) => {
    return await Booking.findByIdAndDelete(bookingId);
};