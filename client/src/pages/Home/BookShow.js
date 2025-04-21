import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loaderSlice";
import { getShowById } from "../../api/shows";
import { useNavigate, useParams } from "react-router-dom";
import { message, Card, Row, Col, Button } from "antd";
import moment from "moment";
import { loadStripe } from "@stripe/stripe-js";
import { 
    Elements,
    useStripe,
    useElements,
    CardElement 
} from "@stripe/react-stripe-js";
import { makePayment, bookShow } from "../../api/booking";

const stripePromise = loadStripe("pk_test_51RDa9gPDaxXsuc2w3CPDE2qPzUP2sxCNwf9fMRRS2JWyzuQm9YUZ72uZ8C4FQZ0foGP4zno1NjTJUKPMmj4Y6IlN00UjgdVKv9");

const PaymentForm = ({ amount, onSuccess, processing }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });

            if (error) {
                setError(error.message);
                return;
            }

            await onSuccess(paymentMethod);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="card-element-container">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            {error && <div className="payment-error">{error}</div>}
            <Button
                type="primary"
                htmlType="submit"
                disabled={!stripe || processing}
                loading={processing}
                block
                style={{ marginTop: '20px' }}
            >
                Pay £{amount}
            </Button>
        </form>
    );
};

const BookShow = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const { user } = useSelector((state) => state.users);
    
    const [show, setShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [clientSecret, setClientSecret] = useState("");
    const [processing, setProcessing] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [booking, setBooking] = useState(null);

    const getData = async () => {
        try {
            dispatch(ShowLoading());
            const response = await getShowById({ showId: params.id });
            if (response.success) {
                setShow(response.data);
            } else {
                message.error(response.message);
            }
            dispatch(HideLoading());
        } catch (error) {
            message.error(error.message);
            dispatch(HideLoading());
        }
    };

    const onToken = async (token) => {
        try {
            dispatch(ShowLoading());
            const amount = selectedSeats.length * show.ticketPrice;
            setTotalAmount(amount);
            
            const response = await makePayment({
                token,
                amount: amount * 100,
                seats: selectedSeats,
                showId: params.id,
                userId: user._id
            });

            if (response.success) {
                setBooking(response.data);
                message.success(response.message);
                navigate('/ticket-view', {
                    state: {
                        booking: response.data,
                        show: show,
                        movie: show.movie
                    }
                });
            } else {
                message.error(response.message);
            }
            dispatch(HideLoading());
        } catch (error) {
            message.error(error.message);
            dispatch(HideLoading());
        }
    };

    const handlePayment = async (paymentMethod) => {
        try {
            setProcessing(true);
            dispatch(ShowLoading());
    
            const stripe = await stripePromise;
            const amount = selectedSeats.length * show.ticketPrice; // Calculate amount
    
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: paymentMethod.id,
            });
    
            if (error) {
                throw new Error(error.message);
            }
    
            if (paymentIntent.status === "succeeded") {
                const bookingResponse = await bookShow({
                    show: params.id,
                    seats: selectedSeats,
                    transactionId: paymentIntent.id,
                    user: user._id,
                    totalAmount: amount, // Add the total amount here
                });
    
                if (bookingResponse.success) {
                    const bookingWithAmount = {
                        ...bookingResponse.data,
                        totalAmount: amount // Ensure amount is included in booking data
                    };
                    
                    setBooking(bookingWithAmount);
                    message.success("Show booked successfully");
                    navigate("/ticket-view", {
                        state: {
                            booking: bookingWithAmount, // Pass the booking with amount
                            show: show,
                            movie: show.movie
                        }
                    });
                } else {
                    message.error(bookingResponse.message);
                }
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setProcessing(false);
            dispatch(HideLoading());
        }
    };
    

    const getSeats = () => {
        let columns = 12;
        let totalSeats = show.totalSeats;
        let rows = Math.ceil(totalSeats / columns);

        return (
            <div className="d-flex flex-column align-items-center">
                <div className="w-100 max-width-600 mx-auto mb-25px">
                    <p className="text-center mb-10px">
                        Screen this side, you will be watching in this direction
                    </p>
                    <div className="screen-div"></div>
                </div>

                <ul className="seat-ul justify-content-center" style={{ marginLeft: "25%" }}>
                    {Array.from(Array(rows).keys()).map((row) =>
                        Array.from(Array(columns).keys()).map((column) => {
                            let seatNumber = row * columns + column + 1;
                            let seatClass = "seat-btn";

                            if (selectedSeats.includes(seatNumber)) {
                                seatClass += " selected";
                            }

                            if (show.bookedSeats.includes(seatNumber)) {
                                seatClass += " booked";
                            }

                            if (seatNumber <= totalSeats) {
                                return (
                                    <li key={seatNumber}>
                                        <button
                                            className={seatClass}
                                            onClick={() => {
                                                if (selectedSeats.includes(seatNumber)) {
                                                    setSelectedSeats(
                                                        selectedSeats.filter(
                                                            (curSeatNumber) => curSeatNumber !== seatNumber
                                                        )
                                                    );
                                                } else {
                                                    setSelectedSeats([...selectedSeats, seatNumber]);
                                                }
                                            }}
                                        >
                                            {seatNumber}
                                        </button>
                                    </li>
                                );
                            }
                            return null;
                        })
                    )}
                </ul>

                <div className="d-flex bottom-card justify-content-between w-100 max-width-600 mx-auto mb-25px mt-3">
                    <div className="flex-1">
                        Selected Seats: <span>{selectedSeats.join(", ")}</span>
                    </div>
                    <div className="flex-shrink-0 ms-3">
                        Total Price: <span>£ {selectedSeats.length * show.ticketPrice}</span>
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (selectedSeats.length > 0) {
            initializePayment();
        }
    }, [selectedSeats]);

    const initializePayment = async () => {
        try {
            dispatch(ShowLoading());
            const response = await makePayment({
                amount: selectedSeats.length * show.ticketPrice,
            });
            
            if (response.success) {
                setClientSecret(response.clientSecret);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error(error.response?.message || "Could not initialize payment");
        } finally {
            dispatch(HideLoading());
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <>
            {show && (
                <Row gutter={24}>
                    <Col span={24}>
                        <Card
                            title={
                                <div className="movie-title-details">
                                    <h1>{show.movie.title}</h1>
                                    <p>
                                        Theatre: {show.theatre.name}, {show.theatre.address}
                                    </p>
                                </div>
                            }
                            extra={
                                <div className="show-name py-3">
                                    <h3>
                                        <span>Date & Time: </span>
                                        {moment(show.date).format("MMM Do YYYY")} at{" "}
                                        {moment(show.time, "HH:mm").format("hh:mm A")}
                                    </h3>
                                    <h3>
                                        <span>Ticket Price:</span> GBP. {show.ticketPrice}/-
                                    </h3>
                                    <h3>
                                        <span>Total Seats:</span> {show.totalSeats}
                                        <span> &nbsp;|&nbsp; Available Seats:</span>{" "}
                                        {show.totalSeats - show.bookedSeats.length}
                                    </h3>
                                </div>
                            }
                            style={{ width: "100%" }}
                        >
                            {getSeats()}

                            {selectedSeats.length > 0 && clientSecret && (
                                <div className="payment-container">
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <PaymentForm
                                            amount={selectedSeats.length * show.ticketPrice}
                                            onSuccess={handlePayment}
                                            processing={processing}
                                        />
                                    </Elements>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            )}
        </>
    );
};

export default BookShow;
