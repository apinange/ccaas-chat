import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Slide,Stack, Typography } from '@mui/material'
import React from 'react';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const list = [
    {
       key:0,
       title: 'Marcar como não lido',
       combination:['Cmd','Shift','U'] 
    },
    {
        key:1,
        title: 'Silenciar',
        combination:['Cmd','Shift','M'] 
     },
     {
        key:2,
        title: 'Arquivar Conversa',
        combination:['Cmd','Shift','E'] 
     },
     {
        key:3,
        title: 'Excluir Conversa',
        combination:['Cmd','Shift','D'] 
     },
     {
        key:4,
        title: 'Fixar Conversa',
        combination:['Cmd','Shift','P'] 
     },
     {
        key:5,
        title: 'Pesquisar',
        combination:['Cmd','F'] 
     },
     {
        key:6,
        title: 'Pesquisar Conversa',
        combination:['Cmd','Shift','F'] 
     },
     {
        key:7,
        title: 'Nova Conversa',
        combination:['Cmd','N'] 
     },
     {
        key:8,
        title: 'Próxima Conversa',
        combination:['Ctrl','Tab'] 
     },
     {
        key:9,
        title: 'Conversa Anterior',
        combination:['Ctrl','Shift','Tab'] 
     },
     {
        key:10,
        title: 'Novo Grupo',
        combination:['Cmd','Shift','N'] 
     },
     {
        key:11,
        title: 'Perfil e Sobre',
        combination:['Cmd','P'] 
     },
     {
        key:12,
        title: 'Aumentar velocidade da mensagem de voz',
        combination:['Shift','.'] 
     },
     {
        key:13,
        title: 'Diminuir velocidade da mensagem de voz',
        combination:['Shift',','] 
     },
     {
        key:14,
        title: 'Configurações',
        combination:['Shift','S'] 
     },
     {
        key:15,
        title: 'Painel de Emojis',
        combination:['Cmd','E'] 
     },
     {
        key:16,
        title: 'Painel de Figurinhas',
        combination:['Cmd','S'] 
     },
  ]

const Shortcuts = ({open, handleClose}) => {
  return (
    <>
    <Dialog fullWidth maxWidth='md' open={open} keepMounted onClose={handleClose} 
    sx={{p:4}} TransitionComponent={Transition}>
        <DialogTitle>
            Atalhos do Teclado
        </DialogTitle>
        <DialogContent sx={{mt:4}}>
            <Grid container spacing={3}>
                {list.map(({key,title,combination})=>
                    <Grid key={key} container item xs={6}>
                        <Stack sx={{width:'100%'}} justifyContent='space-between' 
                        spacing={3} direction='row' alignItems='center'>
                            <Typography variant='caption' sx={{fontSize:14}}>{title}</Typography>
                            <Stack spacing={2} direction='row'>
                                {combination.map((el)=>{
                                    return <Button disabled variant='contained' sx={{color:'#212121'}}>
                                        {el}
                                    </Button>
                                })}
                            </Stack>
                        </Stack>
                    </Grid>
                )}
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button variant='contained' onClick={handleClose}>OK</Button>
        </DialogActions>
    </Dialog>
    </>
  )
}

export default Shortcuts