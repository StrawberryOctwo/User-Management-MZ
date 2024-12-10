import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import DeleteButtonWithConfirmation from '../DeleteButton';
import { t } from "i18next"

type SessionTypePrice = {
    name: string;
    price: number;
};

type DiscountPrice = {
    name: string;
    percentage: number;
};

type ContractCardProps = {
    name: string;
    franchiseName: string;
    sessions: SessionTypePrice[];
    discounts: DiscountPrice[];
    monthly_fee?: number | null;
    one_time_fee?: number | null;
    isVatExempt: boolean;
    vat_percentage: number;
    onEdit: () => void;
    onDelete: () => void;
};

const ContractCard: React.FC<ContractCardProps> = ({
    name,
    franchiseName,
    sessions,
    discounts,
    monthly_fee,
    one_time_fee,
    isVatExempt,
    vat_percentage,
    onEdit,
    onDelete
}) => {
    return (
        <Card sx={{ minWidth: 275, marginBottom: 4, borderRadius: 2, boxShadow: 3, textAlign: 'center', padding: 2 }}>
            <CardContent>
                {/* Display Franchise Name */}
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
                    {franchiseName}
                </Typography>

                {/* Contract Name */}
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                    {name.toUpperCase()}
                </Typography>

                {/* Monthly and One-Time Fees */}
                <Box display="flex" justifyContent="space-around" alignItems="center" sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                            {t("monthly_fee")}
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {monthly_fee ? `€${monthly_fee.toFixed(2)}` : 'No Monthly Fee'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                            One-Time Fee{t("monthly_fee")}
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {one_time_fee ? `€${one_time_fee.toFixed(2)}` : 'No One-Time Fee'}
                        </Typography>
                    </Box>
                </Box>

                {/* Session Prices */}
                <Box mt={2} mb={2} sx={{ borderTop: '1px solid #ddd', pt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>{t("session_prices")}:</Typography>
                    {sessions.map((session, index) => (
                        <Box key={`session-${index}`} display="flex" alignItems="center" justifyContent="center" my={1}>
                            <Typography variant="body2">• {session.name}: €{Number(session.price).toFixed(2)}</Typography>
                        </Box>
                    ))}

                    {/* Discounts */}
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>{t("discounts")}:</Typography>
                    {discounts.filter(discount => discount.percentage > 0).length > 0 ? (
                        discounts.filter(discount => discount.percentage > 0).map((discount, index) => (
                            <Box key={`discount-${index}`} display="flex" alignItems="center" justifyContent="center" my={1}>
                                <Typography variant="body2">
                                    • {discount.name}: {discount.percentage}%
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Box display="flex" alignItems="center" justifyContent="center" my={1}>
                            <Typography variant="body2">{t("no_discounts")}</Typography>
                        </Box>
                    )}

                    {/* VAT {t("status")} */}
                    <Box display="flex" alignItems="center" justifyContent="center" my={1}>
                        {isVatExempt ? (
                            <Typography variant="body2">• {t("vat_exempt")}</Typography>
                        ) : (
                            <Typography variant="body2">• {t("vat_percentage")}: {vat_percentage}%</Typography>
                        )}
                    </Box>
                </Box>

                {/* Action Button */}
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, width: '100%', fontWeight: 'bold', borderRadius: '50px' }}
                    onClick={onEdit}
                >
                    Edit
                </Button>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1, cursor: 'pointer' }}>
                    <DeleteButtonWithConfirmation onDelete={onDelete} />

                </Typography>
            </CardContent>
        </Card>
    );
};

export default ContractCard;
