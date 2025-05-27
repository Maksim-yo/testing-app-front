import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();
  const isAdmin = user?.unsafeMetadata?.isAdmin;

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in"); // или куда хочешь перекинуть после выхода
  };
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <List>
        <ListItemButton onClick={() => navigate("/tests")}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Тесты" />
        </ListItemButton>
        {isAdmin && (
          <ListItemButton onClick={() => navigate("/admin")}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText
              primary="Сотрудники
"
            />
          </ListItemButton>
        )}
        {isAdmin && (
          <ListItemButton onClick={() => navigate("/belbin-role")}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Тест Белбина" />
          </ListItemButton>
        )}

        <ListItemButton onClick={() => navigate("/me")}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Профиль" />
        </ListItemButton>

        <ListItemButton onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Выйти" />
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default Sidebar;
