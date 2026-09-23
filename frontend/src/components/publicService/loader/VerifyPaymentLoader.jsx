import "./VerifyPaymentLoader.css";

const VerifyPaymentLoader = () => {
    return (
        <div className="speed-loader-wrapper" role="status" aria-label="Verifying payment">
            <div className="loader">
                <span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
                <div className="base">
                    <span></span>
                    <div className="face"></div>
                </div>
            </div>
            <div className="longfazers">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
};

export default VerifyPaymentLoader;