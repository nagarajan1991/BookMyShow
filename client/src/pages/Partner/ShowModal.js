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
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      let response = null;

      if (view === "form") {
        response = await addShow({
          ...values,
          theatre: selectedTheatre._id,
        });
      } else {
        response = await updateShow({
          ...values,
          theatre: selectedTheatre._id,
          showId: selectedShow._id,
        });
      }

      if (response.success) {
        message.success(response.message);
        getData();
        setView("table");
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
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
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
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
          layout="vertical"
          className="show-form"
          initialValues={view === "edit" ? selectedShow : null}
          onFinish={onFinish}
        >
          <Row gutter={[24, 16]}>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Show Date"
                name="date"
                rules={[{ required: true, message: "Show date is required!" }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Show Time"
                name="time"
                rules={[{ required: true, message: "Show time is required!" }]}
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
                  defaultValue={selectedMovie && selectedMovie.title}
                  options={movies?.map((movie) => ({
                    value: movie._id,
                    label: movie.title,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Ticket Price"
                name="ticketPrice"
                rules={[{ required: true, message: "Ticket price is required!" }]}
              >
                <Input type="number" placeholder="Enter ticket price" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Total Seats"
                name="totalSeats"
                rules={[{ required: true, message: "Total seats are required!" }]}
              >
                <Input
                  type="number"
                  placeholder="Enter the number of total seats"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="form-actions">
            <Button onClick={() => setView("table")} className="back-button me-3">
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
