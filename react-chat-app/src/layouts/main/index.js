import { Container, Stack, Typography } from "@mui/material";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Logo from "../../components/Logo";

const isAuthenticated = true;

const MainLayout = () => {
  const theme = useTheme();

  if(isAuthenticated){
    return <Navigate to='/app'/>;
  }

  return (
    <>
    <Container sx={{mt:5}} maxWidth='sm'>
      <Stack spacing={5}>
        <Stack sx={{width:'100%'}} direction='column' alignItems={'center'}>
          <Logo size={71} color={theme.palette.primary.main} />
        </Stack>
      </Stack>
      <Outlet />
    </Container>
    
    </>
  );
};

export default MainLayout;
