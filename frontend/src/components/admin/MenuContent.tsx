import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import { useUI } from '../../context/UIContext';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, route: '/admin' },
  { text: 'Products', icon: <AnalyticsRoundedIcon />, route: '/admin/products' },
  { text: 'Categories', icon: <PeopleRoundedIcon />, route: '/admin/categories' },
  { text: 'Orders', icon: <AssignmentRoundedIcon />, route: '/admin/orders' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, route: '/admin/settings' },
  { text: 'About', icon: <InfoRoundedIcon />, route: '/admin/about' },
  { text: 'Feedback', icon: <HelpRoundedIcon />, route: '/admin/feedback' },
];

export default function MenuContent() {
  const location = useLocation();
  const nav = useNavigate();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => {
          const isSelected = location.pathname === item.route;
          return (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton selected={isSelected} onClick={() => {
                nav(item.route);
              }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          )
        }
        )}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton selected={location.pathname === item.route} onClick={() => {
              nav(item.route);
            }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
