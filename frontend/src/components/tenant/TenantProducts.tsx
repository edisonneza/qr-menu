import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
// import AppTheme from './theme/AppTheme';
// import AppAppBar from './components/AppAppBar';
// import MainContent from './MainContent';
// import Latest from '../home/Latest';
import Footer from '../home/Footer';
import { Box, Card, CardContent, CardMedia, Chip, FormControl, Grid, IconButton, InputAdornment, OutlinedInput, styled, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';


const cardDatas = [
    {
        img: 'https://picsum.photos/800/450?random=1',
        tag: 'Engineering',
        title: 'Revolutionizing software development with cutting-edge tools',
        description:
            'Our latest engineering tools are designed to streamline workflows and boost productivity. Discover how these innovations are transforming the software development landscape.',
        authors: [
            { name: 'Remy Sharp', avatar: '/static/images/avatar/1.jpg' },
            { name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' },
        ],
    },
    {
        img: 'https://picsum.photos/800/450?random=2',
        tag: 'Product',
        title: 'Innovative product features that drive success',
        description:
            'Explore the key features of our latest product release that are helping businesses achieve their goals. From user-friendly interfaces to robust functionality, learn why our product stands out.',
        authors: [{ name: 'Erica Johns', avatar: '/static/images/avatar/6.jpg' }],
    },
    {
        img: 'https://picsum.photos/800/450?random=3',
        tag: 'Design',
        title: 'Designing for the future: trends and insights',
        description:
            'Stay ahead of the curve with the latest design trends and insights. Our design team shares their expertise on creating intuitive and visually stunning user experiences.',
        authors: [{ name: 'Kate Morrison', avatar: '/static/images/avatar/7.jpg' }],
    },
    {
        img: 'https://picsum.photos/800/450?random=4',
        tag: 'Company',
        title: "Our company's journey: milestones and achievements",
        description:
            "Take a look at our company's journey and the milestones we've achieved along the way. From humble beginnings to industry leader, discover our story of growth and success.",
        authors: [{ name: 'Cindy Baker', avatar: '/static/images/avatar/3.jpg' }],
    },
    {
        img: 'https://picsum.photos/800/450?random=45',
        tag: 'Engineering',
        title: 'Pioneering sustainable engineering solutions',
        description:
            "Learn about our commitment to sustainability and the innovative engineering solutions we're implementing to create a greener future. Discover the impact of our eco-friendly initiatives.",
        authors: [
            { name: 'Agnes Walker', avatar: '/static/images/avatar/4.jpg' },
            { name: 'Trevor Henderson', avatar: '/static/images/avatar/5.jpg' },
        ],
    },
    {
        img: 'https://picsum.photos/800/450?random=6',
        tag: 'Product',
        title: 'Maximizing efficiency with our latest product updates',
        description:
            'Our recent product updates are designed to help you maximize efficiency and achieve more. Get a detailed overview of the new features and improvements that can elevate your workflow.',
        authors: [{ name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' }],
    },
];


export function Search() {
    return (
        <FormControl
            // sx={{ width: { xs: '100%', md: '25ch' } }}
            variant="outlined">
            <OutlinedInput
                // size="small"
                id="search"
                placeholder="Search…"
                sx={{ flexGrow: 1 }}
                startAdornment={
                    <InputAdornment position="start" sx={{ color: 'text.primary' }}>
                        <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                }
                inputProps={{
                    'aria-label': 'search',
                }}
            />
        </FormControl>
    );
}

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    height: '100%',
    backgroundColor: (theme.vars || theme).palette.background.paper,
    '&:hover': {
        backgroundColor: 'transparent',
        cursor: 'pointer',
    },
    '&:focus-visible': {
        outline: '3px solid',
        outlineColor: 'hsla(210, 98%, 48%, 0.5)',
        outlineOffset: '2px',
    },
}));

const StyledCardContent = styled(CardContent)({
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 16,
    flexGrow: 1,
    '&:last-child': {
        paddingBottom: 16,
    },
});

const StyledTypography = styled(Typography)({
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

export default function TenantProducts(props: { disableCustomTheme?: boolean, slug?: string }) {

    const handleClick = () => {
        console.info('You clicked the filter chip.');
    };

    return (
        <Container
            maxWidth="lg"
            component="main"
            sx={{ display: 'flex', flexDirection: 'column', my: 3, gap: 4 }}
        >

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>
                    <Typography variant="h1" gutterBottom>
                        {props.slug}'s Products
                    </Typography>
                    <Typography>Choose our menu items 😊</Typography>
                </div>

                <Search />


                {/* Categories */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column-reverse', md: 'row' },
                        width: '100%',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'start', md: 'center' },
                        gap: 4,
                        overflow: 'auto',
                    }}
                >
                    <Box
                        sx={{
                            display: 'inline-flex',
                            flexDirection: 'row',
                            gap: 3,
                            overflow: 'auto',
                        }}
                    >
                        <Chip onClick={handleClick} size="medium" label="All categories" />
                        <Chip
                            onClick={handleClick}
                            size="medium"
                            label="Company"
                            sx={{
                                backgroundColor: 'transparent',
                                border: 'none',
                            }}
                        />
                        <Chip
                            onClick={handleClick}
                            size="medium"
                            label="Product"
                            sx={{
                                backgroundColor: 'transparent',
                                border: 'none',
                            }}
                        />
                        <Chip
                            onClick={handleClick}
                            size="medium"
                            label="Design"
                            sx={{
                                backgroundColor: 'transparent',
                                border: 'none',
                            }}
                        />
                        <Chip
                            onClick={handleClick}
                            size="medium"
                            label="Engineering"
                            sx={{
                                backgroundColor: 'transparent',
                                border: 'none',
                            }}
                        />
                    </Box>

                </Box>
                {/* END Categories */}
            </Box>


            <Grid container spacing={2} columns={12}>
                {cardDatas.map((card, index) => (

                    <Grid key={index} size={{ xs: 12, md: 6 }}>
                        <StyledCard
                            variant="outlined"
                            // onFocus={() => handleFocus(0)}
                            // onBlur={handleBlur}
                            tabIndex={0}
                        // className={focusedCardIndex === 0 ? 'Mui-focused' : ''}
                        >
                            <CardMedia
                                component="img"
                                alt="green iguana"
                                image={card.img}
                                sx={{
                                    aspectRatio: '16 / 9',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            />
                            <StyledCardContent>
                                <Typography gutterBottom variant="caption" component="div">
                                    {card.tag}
                                </Typography>
                                <Typography gutterBottom variant="h6" component="div">
                                    {card.title}
                                </Typography>
                                <StyledTypography variant="body2" color="text.secondary" gutterBottom>
                                    {card.description}
                                </StyledTypography>
                            </StyledCardContent>
                        </StyledCard>
                    </Grid>
                ))};
            </Grid>
            {/* <Product /> */}
            {/* <Latest /> */}
        </Container>
    );
}
