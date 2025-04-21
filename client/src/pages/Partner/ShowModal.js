import {
  Col,
  Modal,
  Row,
  Form,
  Input,
  Button,
  Select,
  Table,
  message,
} from "antd";
import { ShowLoading, HideLoading } from "../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getAllMovies } from "../../api/movie";
import {
  addShow,
  deleteShow,
  getShowsByTheatre,
  updateShow,
} from "../../api/shows";
import moment from "moment";

const ShowModal = ({ isShowModalOpen, setIsShowModalOpen, selectedTheatre }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [view, setView] = useState("table");
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleCancel = () => {
    setIsShowModalOpen(false);
    setSelectedShow(null);
    setView("table");
    form.resetFields();
  };

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const moviesResponse = await getAllMovies();
      if (moviesResponse.success) {
        setMovies(moviesResponse.data);
      } else {
        message.error(moviesResponse.message);
      }

      const showsResponse = await getShowsByTheatre({
        theatreId: selectedTheatre._id,
      });
      if (showsResponse.success) {
        setShows(showsResponse.data);
      } else {
        message.error(showsResponse.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };

  const onFinish = async (values) => {
    try {
      await form.validateFields();
      dispatch(ShowLoading());

      // Format the data
      const showData = {
        ...values,
        theatre: selectedTheatre._id,
        date: moment(values.date).format('YYYY-MM-DD'),
        ticketPrice: Number(values.ticketPrice),
        totalSeats: Number(values.totalSeats),
        availableSeats: Number(values.totalSeats)
      };

      let response = null;

      if (view === "form") {
        response = await addShow(showData);
      } else {
        response = await updateShow({
          ...showData,
          showId: selectedShow._id,
        });
      }

      if (response.success) {
        message.success(response.message);
        getData();
        setView("table");
        form.resetFields();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };

  const handleDelete = async (showId) => {
    try {
      dispatch(ShowLoading());
      const response = await deleteShow({ showId });
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      dispatch(HideLoading());
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (text) => moment(text).format("MMM Do YYYY"),
    },
    {
      title: "Time",
      dataIndex: "time",
    },
    {
      title: "Movie",
      dataIndex: "movie",
      render: (text, record) => record.movie.title,
    },
    {
      title: "Ticket Price",
      dataIndex: "ticketPrice",
    },
    {
      title: "Total Seats",
      dataIndex: "totalSeats",
    },
    {
      title: "Available Seats",
      dataIndex: "availableSeats",
      render: (text, record) => record.totalSeats - record.bookedSeats?.length,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <div className="d-flex gap-2">
          <EditOutlined
            onClick={() => {
              setSelectedShow(record);
              setView("edit");
            }}
          />
          <DeleteOutlined onClick={() => handleDelete(record._id)} />
        </div>
      ),
    },
  ];

  // Form management useEffect
  useEffect(() => {
    if (view === 'form') {
      form.resetFields();
    } else if (view === 'edit' && selectedShow) {
      form.setFieldsValue({
        ...selectedShow,
        date: moment(selectedShow.date).format('YYYY-MM-DD'),
        movie: selectedShow.movie._id
      });
    }
  }, [view, selectedShow, form]);

  // Initial data loading
  useEffect(() => {
    getData();
  }, []);

  return (
    <Modal
      centered
      title={selectedTheatre.name}
      open={isShowModalOpen}
      onCancel={handleCancel}
      width={1200}
      footer={null}
      className="show-modal"
    >
      <div className="d-flex justify-content-between mb-3">
        <h3 className="modal-section-title">
          {view === "table"
            ? "List of Shows"
            : view === "form"
            ? "Add Show"
            : "Edit Show"}
        </h3>
        {view === "table" && (
          <Button type="primary" onClick={() => setView("form")}>
            Add Show
          </Button>
        )}
      </div>

      {view === "table" && <Table dataSource={shows} columns={columns} />}

      {(view === "form" || view === "edit") && (
        <Form
          form={form}
          layout="vertical"
          className="show-form"
          onFinish={onFinish}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Show Date"
                name="date"
                rules={[
                  { required: true, message: "Show date is required!" },
                  {
                    validator: (_, value) => {
                      if (value && moment(value).isBefore(moment().startOf('day'))) {
                        return Promise.reject('Cannot select past dates');
                      }
                      if (value && moment(value).isAfter(moment().add(3, 'months'))) {
                        return Promise.reject('Cannot select dates more than 3 months in advance');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input 
                  type="date" 
                  min={moment().format('YYYY-MM-DD')}
                  max={moment().add(3, 'months').format('YYYY-MM-DD')}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Show Time"
                name="time"
                dependencies={['date']}
                rules={[
                  { required: true, message: "Show time is required!" },
                  {
                    validator: (_, value) => {
                      const date = form.getFieldValue('date');
                      if (date && value && moment(date).isSame(moment(), 'day')) {
                        const selectedTime = moment(value, 'HH:mm');
                        const currentTime = moment();
                        if (selectedTime.isBefore(currentTime)) {
                          return Promise.reject('Cannot select past time for today');
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input type="time" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Select Movie"
                name="movie"
                rules={[{ required: true, message: "Movie is required!" }]}
              >
                <Select
                  placeholder="Select Movie"
                  options={movies?.map((movie) => ({
                    value: movie._id,
                    label: movie.title,
                  }))}
                  onChange={(value) => {
                    const movie = movies.find(m => m._id === value);
                    setSelectedMovie(movie);
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Ticket Price"
                name="ticketPrice"
                rules={[
                  { required: true, message: "Ticket price is required!" },
                  { type: 'number', min: 1, message: "Price must be greater than 0" },
                  { type: 'number', max: 10000, message: "Price cannot exceed 10000" }
                ]}
              >
                <Input 
                  type="number"
                  min="1"
                  max="10000"
                  onChange={(e) => form.setFieldsValue({ 
                    ticketPrice: Number(e.target.value) 
                  })}
                  placeholder="Enter ticket price"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
  <Form.Item
    label="Total Seats"
    name="totalSeats"
    rules={[
      { required: true, message: "Total seats are required!" },
      { 
        validator: async (_, value) => {
          const seats = Number(value);
          if (isNaN(seats)) {
            throw new Error('Please enter a valid number');
          }
          if (seats < 1) {
            throw new Error('Seats must be greater than 0');
          }
          if (seats > 500) {
            throw new Error('Seats cannot exceed 500');
          }
          return Promise.resolve();
        }
      }
    ]}
  >
    <Input
      type="number"
      min="1"
      max="500"
      onChange={(e) => {
        const value = Number(e.target.value);
        form.setFieldsValue({ 
          totalSeats: value 
        });
      }}
      placeholder="Enter the number of total seats"
    />
  </Form.Item>
</Col>

          </Row>

          <div className="form-actions">
            <Button 
              onClick={() => {
                setView("table");
                form.resetFields();
              }} 
              className="back-button me-3"
            >
              <ArrowLeftOutlined /> Go Back
            </Button>
            <Button type="primary" htmlType="submit">
              {view === "form" ? "Add Show" : "Update Show"}
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default ShowModal;
