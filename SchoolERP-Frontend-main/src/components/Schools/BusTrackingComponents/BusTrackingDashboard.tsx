import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  Avatar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  DirectionsBus as BusIcon,
  Person as DriverIcon,
  Speed as SpeedIcon,
  LocalGasStation as FuelIcon,
  Warning as AlertIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  ErrorOutline as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import { 
  useBuses, 
  useDrivers, 
  useRoutes, 
  useAlerts,
  useTripLogs
} from '../../../context/BusTrackingContext';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const StatCard = ({ icon, title, value, color, progress = -1 }: { 
  icon: React.ReactNode, 
  title: string, 
  value: string | number, 
  color: string,
  progress?: number
}) => (
  <StyledCard>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" align="center" sx={{ my: 2, fontWeight: 'bold' }}>
        {value}
      </Typography>
      {progress >= 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5 }} />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">{`${Math.round(progress)}%`}</Typography>
          </Box>
        </Box>
      )}
    </CardContent>
  </StyledCard>
);

// Map component (placeholder)
const BusMap = () => (
  <Paper
    sx={{
      height: '100%',
      minHeight: 400,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: '#f5f5f5',
      backgroundImage: 'url("https://via.placeholder.com/1200x600?text=Bus+Tracking+Map")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2 }}>
      <Typography variant="h6">Interactive Bus Map</Typography>
      <Typography variant="body2">Real-time tracking of all school buses</Typography>
    </Box>
  </Paper>
);

const BusTrackingDashboard: React.FC = () => {
  const { buses, loading: busesLoading, fetchBuses } = useBuses();
  const { drivers, loading: driversLoading } = useDrivers();
  const { routes, loading: routesLoading } = useRoutes();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { tripLogs, loading: tripsLoading } = useTripLogs();

  const handleRefresh = () => {
    fetchBuses();
  };

  // Calculate statistics
  const activeBuses = buses.filter(bus => bus.status === 'ACTIVE').length;
  const totalBuses = buses.length;
  const busUtilization = totalBuses > 0 ? (activeBuses / totalBuses) * 100 : 0;

  const activeDrivers = drivers.filter(driver => driver.status === 'ACTIVE').length;
  const totalDrivers = drivers.length;

  const activeRoutes = routes.filter(route => route.status === 'ACTIVE').length;
  const totalRoutes = routes.length;

  const criticalAlerts = alerts.filter(alert => alert.priority === 'HIGH').length;

  const onTimeTrips = tripLogs.filter(trip => {
    if (!trip.stopLogs || trip.stopLogs.length === 0) return true;
    return trip.stopLogs.every(stop => {
      if (!stop.actualArrivalTime || !stop.scheduledArrivalTime) return true;
      const actual = new Date(stop.actualArrivalTime).getTime();
      const scheduled = new Date(stop.scheduledArrivalTime).getTime();
      // Less than 5 minute delay
      return (actual - scheduled) < 5 * 60 * 1000;
    });
  }).length;
  const totalTrips = tripLogs.length;
  const onTimePercentage = totalTrips > 0 ? (onTimeTrips / totalTrips) * 100 : 0;

  const recentAlerts = alerts.slice(0, 5);

  const isLoading = busesLoading || driversLoading || routesLoading || alertsLoading || tripsLoading;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bus Tracking Dashboard
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Row */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<BusIcon />} 
            title="Buses" 
            value={`${activeBuses}/${totalBuses}`} 
            color="#1976d2"
            progress={busUtilization}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<DriverIcon />} 
            title="Drivers" 
            value={`${activeDrivers}/${totalDrivers}`} 
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<ScheduleIcon />} 
            title="Routes" 
            value={`${activeRoutes}/${totalRoutes}`} 
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<AlertIcon />} 
            title="Critical Alerts" 
            value={criticalAlerts} 
            color="#d32f2f"
          />
        </Grid>

        {/* Map Row */}
        <Grid item xs={12} md={8}>
          <BusMap />
        </Grid>

        {/* Alerts Column */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Alerts</Typography>
              <Button size="small" color="primary">View All</Button>
            </Box>
            <Divider />
            <List>
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <ListItem key={alert.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alert.priority === 'HIGH' ? '#d32f2f' : '#ed6c02' }}>
                        <ErrorIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={alert.title}
                      secondary={`${alert.description} - ${new Date(alert.timestamp).toLocaleString()}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#2e7d32' }}>
                      <CheckIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="No recent alerts"
                    secondary="All systems running normally"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* On Time Performance */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#673ab7', mr: 2 }}>
                  <SpeedIcon />
                </Avatar>
                <Typography variant="h6">
                  On-Time Performance
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={onTimePercentage} 
                    sx={{ 
                      height: 20, 
                      borderRadius: 5,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: onTimePercentage > 80 ? '#2e7d32' : 
                                         onTimePercentage > 60 ? '#ed6c02' : '#d32f2f'
                      }
                    }} 
                  />
                </Box>
                <Box sx={{ minWidth: 50, textAlign: 'right' }}>
                  <Typography variant="body2" fontWeight="bold">{`${Math.round(onTimePercentage)}%`}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {`${onTimeTrips} out of ${totalTrips} trips arrived on time today`}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusTrackingDashboard; 