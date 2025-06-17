'use client';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import styles from './../../src/app/dashboard/dashboard.module.css';

type Invoice = {
    createdAt: string;
    totalPrice: number;
};

type Props = {
    todayTotal: number | null;
    invoices: Invoice[];
};

function getTodayInAlbanian() {
    const days = ['E Diel', 'E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë'];
    const months = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];

    const today = new Date();
    const dayName = days[today.getDay()];
    const date = today.getDate();
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();

    return `${dayName}, ${date} ${monthName} ${year}`;
}

export default function TodaySaleCard({ todayTotal, invoices }: Props) {
    const chartData = Array.from({ length: 24 }, (_, hour) => {
        const hourTotal = invoices
            .filter(inv => new Date(inv.createdAt).getHours() === hour)
            .reduce((sum, inv) => sum + inv.totalPrice, 0);
        return {
            hour,
            value: parseFloat(hourTotal.toFixed(2)),
        };
    });

    return (
        <div className={`${styles.card} ${styles.card1}`}>
            <div className={styles.salesCard}>
                <div className={styles.cardHeader} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3>Totali Shitjes</h3>
                    <div style={{fontSize: '0.8rem', color: '#777272', textAlign: 'right'}}>
                        {getTodayInAlbanian()}
                    </div>
                </div>

                <div className={styles.price} style={{marginTop: '0.5rem'}}>
                    {todayTotal !== null ? `${todayTotal.toFixed(2)}€` : 'Loading...'}
                </div>

                <div className={styles.chartWrapper} style={{marginTop: '1rem'}}>
                    <ResponsiveContainer width="100%" height={50}>
                        <LineChart data={chartData}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#2ecc71"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className={styles.growth}>
                    <span className={styles.upArrow}>↑</span> 5.2%
                </div>
            </div>
        </div>
    );
}
