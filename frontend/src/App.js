import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const BACKEND = "http://localhost:3001";

function hesaplaAlimGucu(inflation) {
  return inflation.map(item => ({
    date: item.date,
    value: parseFloat((100 / (1 + item.value / 100)).toFixed(2))
  }));
}

export default function App() {
  const [inflation, setInflation] = useState([]);
  const [exchange, setExchange] = useState([]);
  const [alimGucu, setAlimGucu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${BACKEND}/api/inflation`).then(r => r.json()),
      fetch(`${BACKEND}/api/exchange`).then(r => r.json()),
    ])
      .then(([inf, exc]) => {
        if (inf.success) {
          setInflation(inf.data);
          setAlimGucu(hesaplaAlimGucu(inf.data));
        }
        if (exc.success) setExchange(exc.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const latestInflation = inflation.length ? inflation[inflation.length - 1] : null;
  const latestExchange = exchange.length ? exchange[exchange.length - 1] : null;
  const firstExchange = exchange.length ? exchange[0] : null;
  const latestAlimGucu = alimGucu.length ? alimGucu[alimGucu.length - 1] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      color: "#e5e5e5",
      fontFamily: "system-ui, sans-serif",
      padding: "2rem"
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 4, color: "#fff" }}>
        TL'nin Değeri
      </h1>
      <p style={{ color: "#888", marginBottom: "2rem", fontSize: 14 }}>
        Türkiye enflasyon ve döviz kuru verileri — Dünya Bankası
      </p>

      {loading && <p style={{ color: "#888" }}>Veriler yükleniyor...</p>}
      {error && <p style={{ color: "#e24b4a" }}>Hata: {error}</p>}

      {!loading && !error && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: "2rem" }}>
            <div style={cardStyle}>
              <p style={labelStyle}>Son Enflasyon</p>
              <p style={valueStyle}>{latestInflation ? `%${latestInflation.value}` : "-"}</p>
              <p style={subStyle}>{latestInflation?.date}</p>
            </div>
            <div style={cardStyle}>
              <p style={labelStyle}>Son USD/TL</p>
              <p style={valueStyle}>{latestExchange ? `₺${latestExchange.value}` : "-"}</p>
              <p style={subStyle}>{latestExchange?.date}</p>
            </div>
            <div style={cardStyle}>
              <p style={labelStyle}>Kur Artışı</p>
              <p style={{ ...valueStyle, color: "#e24b4a" }}>
                {firstExchange && latestExchange
                  ? `${((latestExchange.value / firstExchange.value) * 100).toFixed(0)}x`
                  : "-"}
              </p>
              <p style={subStyle}>{firstExchange?.date} → {latestExchange?.date}</p>
            </div>
            <div style={cardStyle}>
              <p style={labelStyle}>100 TL'nin Alım Gücü</p>
              <p style={{ ...valueStyle, color: "#e24b4a" }}>
                {latestAlimGucu ? `₺${latestAlimGucu.value}` : "-"}
              </p>
              <p style={subStyle}>{alimGucu[0]?.date} → {latestAlimGucu?.date}</p>
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitle}>TL Alım Gücü (2003 = ₺100)</h2>
            <p style={{ color: "#666", fontSize: 13, marginBottom: "1rem", marginTop: 0 }}>
              2003'te ₺100 ile alınabilen şeyin zamanla kaç TL'ye eşdeğer olduğu
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={alimGucu} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#555" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 12 }} unit="₺" />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#aaa" }}
                  itemStyle={{ color: "#ef9f27" }}
                  formatter={(v) => [`₺${v}`, "Alım Gücü"]}
                />
                <Line type="monotone" dataKey="value" stroke="#ef9f27" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitle}>Yıllık Enflasyon (%)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inflation} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#555" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 12 }} unit="%" />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#aaa" }}
                  itemStyle={{ color: "#e24b4a" }}
                  formatter={(v) => [`%${v}`, "Enflasyon"]}
                />
                <Line type="monotone" dataKey="value" stroke="#e24b4a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={sectionStyle}>
            <h2 style={sectionTitle}>USD/TL Kuru (Yıllık Ortalama)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={exchange} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#555" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 12 }} unit="₺" />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#aaa" }}
                  itemStyle={{ color: "#378add" }}
                  formatter={(v) => [`₺${v}`, "USD/TL"]}
                />
                <Line type="monotone" dataKey="value" stroke="#378add" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p style={{ color: "#555", fontSize: 12, marginTop: "2rem", textAlign: "center" }}>
            Kaynak: Dünya Bankası — Türkiye verileri
          </p>
        </>
      )}
    </div>
  );
}

const cardStyle = {
  background: "#1a1a1a",
  borderRadius: 10,
  padding: "1rem",
  border: "1px solid #2a2a2a"
};

const labelStyle = {
  fontSize: 12,
  color: "#666",
  margin: "0 0 6px"
};

const valueStyle = {
  fontSize: 24,
  fontWeight: 600,
  color: "#fff",
  margin: "0 0 4px"
};

const subStyle = {
  fontSize: 11,
  color: "#555",
  margin: 0
};

const sectionStyle = {
  background: "#1a1a1a",
  borderRadius: 12,
  padding: "1.5rem",
  border: "1px solid #2a2a2a",
  marginBottom: "1.5rem"
};

const sectionTitle = {
  fontSize: 16,
  fontWeight: 500,
  color: "#ccc",
  margin: "0 0 0.5rem"
};