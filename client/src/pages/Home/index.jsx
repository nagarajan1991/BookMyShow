import { useEffect, useState, useCallback } from "react";
import { HideLoading, ShowLoading } from "../../redux/loaderSlice";
import { useDispatch } from "react-redux";
import { getAllMovies } from "../../api/movie";
import { message, Row, Col, Input, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title } = Typography;

function Home() {
  const [movies, setMovies] = useState(null);
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllMovies();
      if (response.success) {
        setMovies(response.data);
      } else {
        message.error(response.message);
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      dispatch(HideLoading());
    }
  }, [dispatch]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div className="container">

      {/* Search Section */}
      <div class="search-container">
    <div class="search-wrapper">
        <Input
          size="large"
          placeholder="Search for movies"
          prefix={<SearchOutlined style={{ color: '#666' }} />}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
      </div>
      </div>



      {/* Movies Grid */}
      <div className="movies-section" style={{ padding: '0 24px' }}>
        <Title level={2} style={{ marginBottom: 24 }}>Now Showing</Title>
        <Row gutter={[24, 24]}>
          {movies?.filter(movie => 
            movie?.title?.toLowerCase().includes(searchText.toLowerCase())
          ).map(movie => (
// In your Home/index.jsx file, update the Card section within the Row mapping:
<Col xs={12} sm={8} md={6} lg={4} key={movie._id}>
  <Card 
    hoverable
    className="movie-card"
    cover={
      <div className="movie-poster-container">
        <img
          alt={movie.title}
          src={movie.poster}
          className="movie-poster"
          onClick={() => navigate(`/movie/${movie._id}?date=${moment().format("YYYY-MM-DD")}`)}
        />
      </div>
    }
    bodyStyle={{ padding: '12px 16px' }}
  >
    <div className="movie-info">
      <h3 className="movie-title" onClick={() => navigate(`/movie/${movie._id}`)}>{movie.title}</h3>
      <div className="movie-meta">
        <div>{movie.genre}</div>
        <div>{movie.language}</div>
      </div>
    </div>
  </Card>
</Col>

          ))}
        </Row>
      </div>
    </div>
  );
}



export default Home;