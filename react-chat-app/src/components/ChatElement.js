import { Avatar, Badge, Box, Stack, Typography } from '@mui/material';
import {useTheme , styled} from '@mui/material/styles';
import StyledBadge from './StyledBadge';
import createAvatar from '../utils/createAvatar';

//single chat element
const ChatElement = ({id,name, img, msg, time,online, unread, onClick, conversation_id, sx}) => {
    const theme = useTheme();
    const avatarData = createAvatar(name || 'U');
    
    return (
      <Box 
        onClick={onClick}
        sx={{
          width: "100%",
          borderRadius: 1,
          backgroundColor: theme.palette.mode === 'light'? "#fff" : theme.palette.background.default,
          cursor: onClick ? 'pointer' : 'default',
          overflow: 'hidden',
          '&:hover': onClick ? {
            backgroundColor: theme.palette.mode === 'light'? "#f5f5f5" : theme.palette.action.hover
          } : {},
          ...sx
        }}
        p={2}>
        <Stack direction="row" alignItems='center' justifyContent='space-between' sx={{ width: '100%', overflow: 'hidden' }}>
          <Stack direction='row' spacing={2} sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            {online ? <StyledBadge overlap='circular' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot">
            {img ? (
              <Avatar src={img} />
            ) : (
              <Avatar sx={{ bgcolor: theme.palette[avatarData.color]?.main || theme.palette.primary.main, color: '#fff' }}>
                {avatarData.name}
              </Avatar>
            )}
            </StyledBadge> : (
              img ? (
                <Avatar src={img} />
              ) : (
                <Avatar sx={{ bgcolor: theme.palette[avatarData.color]?.main || theme.palette.primary.main, color: '#fff' }}>
                  {avatarData.name}
                </Avatar>
              )
            )}
            
            <Stack spacing={0.3} sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <Typography variant='subtitle2' noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name}
              </Typography>
              <Typography 
                variant='caption' 
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {msg}
              </Typography>
            </Stack>
            </Stack>
            <Stack spacing={2} alignItems='center' sx={{ flexShrink: 0 }}>
              <Typography sx={{fontWeight:600}} variant='caption' noWrap>
                {time}
              </Typography>
              <Badge color='primary' badgeContent={unread}>
  
              </Badge>
            </Stack>
          
          
        </Stack>
  

      </Box>
    )
  };

  export default ChatElement