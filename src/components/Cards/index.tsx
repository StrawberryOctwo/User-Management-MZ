import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

type ContractCardProps = {
    name: string;
    sessions: { name: string; price: number }[];
    discount_name: string;
    discount_percentage: number;
    monthly_fee?: number | null;
    one_time_fee?: number | null;
    isVatExempt: boolean;
    vat_percentage: number;
};

const ContractCard: React.FC<ContractCardProps> = ({
    name,
    sessions,
    discount_name,
    discount_percentage,
    monthly_fee,
    one_time_fee,
    isVatExempt,
    vat_percentage,
}) => {
    return (
        <Card sx={{ minWidth: 275, marginBottom: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
            <CardContent>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                    {name.toUpperCase()}
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1rem', mb: 2 }}>
                    {monthly_fee !== null ? `€${monthly_fee.toFixed(2)} / MONTH` : 'ONE-TIME FEE'}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {monthly_fee !== null ? `€${monthly_fee.toFixed(2)}` : `€${one_time_fee?.toFixed(2)}`}
                </Typography>
                <Box mt={2} mb={2} sx={{ borderTop: '1px solid #ddd', pt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Features:</Typography>
                    {sessions.map((session, index) => (
                        <Box key={`session-${index}`} display="flex" alignItems="center" justifyContent="center" my={1}>
                            <CheckIcon sx={{ color: '#4caf50', mr: 1 }} />
                            <Typography variant="body2">{session.name}: €{session.price.toFixed(2)}</Typography>
                        </Box>
                    ))}
                    <Box display="flex" alignItems="center" justifyContent="center" my={1}>
                        <CheckIcon sx={{ color: '#4caf50', mr: 1 }} />
                        <Typography variant="body2">
                            Discount: {discount_name} ({discount_percentage}%)
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" justifyContent="center" my={1}>
                        {isVatExempt ? (
                            <>
                                <CheckIcon sx={{ color: '#4caf50', mr: 1 }} />
                                <Typography variant="body2">VAT Exempt</Typography>
                            </>
                        ) : (
                            <>
                                <CloseIcon sx={{ color: '#f44336', mr: 1 }} />
                                <Typography variant="body2">VAT Percentage: {vat_percentage}%</Typography>
                            </>
                        )}
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, width: '100%', fontWeight: 'bold', borderRadius: '50px' }}
                >
                    Buy Now
                </Button>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1, cursor: 'pointer' }}>
                    See Details
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ContractCard;
