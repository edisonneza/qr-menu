// import { Grid } from "@mui/material";

// export function TenantProducts(props: { disableCustomTheme?: boolean, slug?: string }) {

//     return (
//         <Grid container spacing={2} columns={12}>
//             <Grid size={{ xs: 12, md: 6 }}>
//                 <StyledCard
//                     variant="outlined"
//                     onFocus={() => handleFocus(0)}
//                     onBlur={handleBlur}
//                     tabIndex={0}
//                     className={focusedCardIndex === 0 ? 'Mui-focused' : ''}
//                 >
//                     <CardMedia
//                         component="img"
//                         alt="green iguana"
//                         image={cardData[0].img}
//                         sx={{
//                             aspectRatio: '16 / 9',
//                             borderBottom: '1px solid',
//                             borderColor: 'divider',
//                         }}
//                     />
//                     <StyledCardContent>
//                         <Typography gutterBottom variant="caption" component="div">
//                             {cardData[0].tag}
//                         </Typography>
//                         <Typography gutterBottom variant="h6" component="div">
//                             {cardData[0].title}
//                         </Typography>
//                         <StyledTypography variant="body2" color="text.secondary" gutterBottom>
//                             {cardData[0].description}
//                         </StyledTypography>
//                     </StyledCardContent>
//                     <Author authors={cardData[0].authors} />
//                 </StyledCard>
//             </Grid>
//             );
// };