// TicketView.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { DownloadOutlined } from '@ant-design/icons';

const TicketView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, show, movie } = location.state || {};
  const { user } = useSelector((state) => state.users);

  if (!booking || !show || !movie) {
    return navigate('/profile');
  }

  const generateQRData = () => {
    return JSON.stringify({
      bookingId: booking._id,
      showTime: show.time,
      seats: booking.seats,
      userId: user._id
    });
  };

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '2rem auto',
      padding: '0 1rem',
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    posterSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
    },
    posterContainer: {
      aspectRatio: '2/3',
      width: '100%',
      maxWidth: '300px',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    poster: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    },
    downloadButton: {
      minWidth: '160px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    ticketDetails: {
      padding: '0 1rem',
    },
    movieTitle: {
      fontSize: '1.8rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      color: '#1a1a1a',
    },
    detailsGrid: {
      display: 'grid',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    detailItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    label: {
      color: '#666',
      fontSize: '0.9rem',
    },
    value: {
      color: '#1a1a1a',
      fontSize: '1rem',
    },
    qrSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.5rem',
      background: '#f8f8f8',
      borderRadius: '8px',
      marginTop: '1rem',
    },
    qrText: {
      marginTop: '0.5rem',
      color: '#666',
    },
  };

  // Media query styles for mobile devices
  if (window.innerWidth <= 768) {
    styles.container.margin = '1rem auto';
    styles.posterContainer.maxWidth = '200px';
    styles.movieTitle.fontSize = '1.5rem';
    styles.movieTitle.textAlign = 'center';
    styles.ticketDetails.padding = '0';
    styles.ticketDetails.marginTop = '1rem';
  }

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <Row gutter={[24, 24]}>
          {/* Movie Poster Section */}
          <Col xs={24} md={8}>
            <div style={styles.posterSection}>
              <div style={styles.posterContainer}>
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  style={styles.poster}
                />
              </div>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => window.print()}
                style={styles.downloadButton}
              >
                Download Ticket
              </Button>
            </div>
          </Col>

          {/* Ticket Details Section */}
          <Col xs={24} md={16}>
            <div style={styles.ticketDetails}>
              <h1 style={styles.movieTitle}>{movie.title}</h1>
              
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <label style={styles.label}>Date & Time</label>
                  <span style={styles.value}>
                    {moment(show.date).format('MMM Do YYYY')} at {moment(show.time, 'HH:mm').format('hh:mm A')}
                  </span>
                </div>

                <div style={styles.detailItem}>
                  <label style={styles.label}>Seats</label>
                  <span style={styles.value}>{booking.seats.join(', ')}</span>
                </div>

                <div style={styles.detailItem}>
                  <label style={styles.label}>Booking ID</label>
                  <span style={styles.value}>{booking._id}</span>
                </div>

                <div style={styles.detailItem}>
                  <label style={styles.label}>Amount Paid</label>
                  <span style={styles.value}>£{booking.totalAmount}</span>
                </div>
              </div>

              {/* QR Code Section */}
              <div style={styles.qrSection}>
                <QRCodeSVG
                  value={generateQRData()}
                  size={128}
                  level="H"
                  includeMargin={true}
                />
                <p style={styles.qrText}>Scan for entry</p>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TicketView;
