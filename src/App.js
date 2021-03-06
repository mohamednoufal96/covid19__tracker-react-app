import { FormControl, Select, MenuItem, Card, CardContent } from "@material-ui/core";
import { React, useEffect, useState } from "react";
import InfoBox from "./components/InfoBox";
import Map from "./components/Map";
import Table from "./components/Table";
import { prettyPrintStat, sortData } from "./util";
import LineGraph from "./components/LineGraph";
import "leaflet/dist/leaflet.css";
import "./App.css";

function App() {
    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState("worldwide");
    const [countryInfo, setCountryInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [casesType, setCasesType] = useState("cases");
    const [mapCenter, setMapCenter] = useState({ lat: 21.7679, lng: 78.8718 });
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);

    useEffect(() => {
        fetch("https://disease.sh/v3/covid-19/all")
            .then((response) => response.json())
            .then((data) => {
                setCountryInfo(data);
            });
    }, []);

    useEffect(() => {
        const getCountries = async () => {
            await fetch("https://disease.sh/v3/covid-19/countries")
                .then((response) => response.json())
                .then((data) => {
                    const countries = data.map((country) => ({
                        name: country.country,
                        value: country.countryInfo.iso2,
                    }));
                    console.log("Countries info >>>>", data);
                    let sortedData = sortData(data);
                    setTableData(sortedData);
                    setCountries(countries);
                    setMapCountries(data);
                });
        };
        getCountries();
    }, []);

    const onCountryChange = async (event) => {
        const countryCode = event.target.value;
        const url =
            countryCode === "worldwide"
                ? "https://disease.sh/v3/covid-19/all"
                : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
        await fetch(url)
            .then((resp) => resp.json())
            .then((data) => {
                setCountry(countryCode);
                setCountryInfo(data);
                setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
                setMapZoom(4);
            });
    };

    console.log("country info >> ", countryInfo);

    return (
        <div className="app">
            <div className="app__left">
                <div className="app__header">
                    <h1>COVID-19 TRACKER</h1>
                    <FormControl className="app__dropdown">
                        <Select variant="outlined" value={country} onChange={onCountryChange}>
                            <MenuItem value="worldwide"> Worldwide</MenuItem>
                            {countries.map((country, index) => {
                                return (
                                    <MenuItem key={index} value={country.value}>
                                        {country.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </div>
                <div className="app__stats">
                    <InfoBox
                        isRed
                        active={casesType === "cases"}
                        onClick={(event) => setCasesType("cases")}
                        title="Covid-19 Cases"
                        cases={prettyPrintStat(countryInfo.todayCases)}
                        total={prettyPrintStat(countryInfo.cases)}
                    />
                    <InfoBox
                        active={casesType === "recovered"}
                        onClick={(event) => setCasesType("recovered")}
                        title="Recovered"
                        cases={prettyPrintStat(countryInfo.todayRecovered)}
                        total={prettyPrintStat(countryInfo.recovered)}
                    />
                    <InfoBox
                        isRed
                        active={casesType === "deaths"}
                        onClick={(event) => setCasesType("deaths")}
                        title="Death"
                        cases={prettyPrintStat(countryInfo.todayDeaths)}
                        total={prettyPrintStat(countryInfo.deaths)}
                    />
                </div>

                <Map countries={mapCountries} casesType={casesType} center={mapCenter} zoom={mapZoom} />
            </div>

            <Card className="app__right">
                <CardContent>
                    <h3 className="app__tableTitle">Live Cases by Country</h3>
                    <Table countries={tableData} />
                    <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
                    <LineGraph className="app__graph" casesType={casesType} />
                </CardContent>
            </Card>
        </div>
    );
}

export default App;
