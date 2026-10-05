const sendSuccessResponse = (res, data, message = "Success", statusCode = 200) => {
    res.status(statusCode).json({
        status: true,
        message,
        data
    });
};

const sendErrorResponse = (res, error, message = "Error", statusCode = 500) => {
    res.status(statusCode).json({
        status: false,
        message,
        error
    });
}

module.exports = {
    sendSuccessResponse,
    sendErrorResponse
}