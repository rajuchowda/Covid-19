import {useParams} from 'react-router-dom'
import {useEffect, useState} from 'react'
import BarChartComponent from '../BarChartComponent'
import LineChartComponent from '../LineChartComponent'
import StateTotalData from '../StateTotalData'
import './index.css'

const StateSpecific = () => {
  const {stateCode} = useParams()
  const [barChartData, setBarChartData] = useState([])
  const [lineChartsData, setLineChartsData] = useState([])
  const [testedCases, setTestedCases] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Countrywide state-wise data
        const countryRes = await fetch('https://apis.ccbp.in/covid19-state-wise-data')
        const countryData = await countryRes.json()

        if (countryData[stateCode] && countryData[stateCode].total) {
          const total = countryData[stateCode].total
          const confirmed = total.confirmed || 0
          const recovered = total.recovered || 0
          const deceased = total.deceased || 0
          const tested = total.tested || 0
          const active = confirmed - recovered - deceased

          setTestedCases(tested)

          setBarChartData([
            {category: 'Confirmed', value: confirmed},
            {category: 'Active', value: active},
            {category: 'Recovered', value: recovered},
            {category: 'Deceased', value: deceased},
            {category: 'Tested', value: tested},
          ])
        }

        // State timelines data
        const timelineRes = await fetch('https://apis.ccbp.in/covid19-timelines-data')
        const timelineData = await timelineRes.json()

        if (timelineData[stateCode] && timelineData[stateCode].dates) {
          const datesData = timelineData[stateCode].dates
          const dates = Object.keys(datesData).slice(-10)

          const confirmedData = []
          const activeData = []
          const recoveredData = []
          const deceasedData = []
          const testedData = []

          dates.forEach(date => {
            const dayData = datesData[date].total || {}
            const confirmed = dayData.confirmed || 0
            const recovered = dayData.recovered || 0
            const deceased = dayData.deceased || 0
            const tested = dayData.tested || 0
            const active = confirmed - recovered - deceased

            confirmedData.push({date, value: confirmed})
            activeData.push({date, value: active})
            recoveredData.push({date, value: recovered})
            deceasedData.push({date, value: deceased})
            testedData.push({date, value: tested})
          })

          setLineChartsData([
            {label: 'Confirmed', data: confirmedData},
            {label: 'Active', data: activeData},
            {label: 'Recovered', data: recoveredData},
            {label: 'Deceased', data: deceasedData},
            {label: 'Tested', data: testedData},
          ])
        }
      } catch (e) {
        console.error('Error fetching data', e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [stateCode])

  if (loading) return <p>Loading...</p>

  return (
    <div className="state-specific-container">
      {barChartData.length > 0 && <BarChartComponent data={barChartData} />}

      <StateTotalData
        eachStateTotalData={{
          confirmed: barChartData[0]?.value || 0,
          active: barChartData[1]?.value || 0,
          recovered: barChartData[2]?.value || 0,
          deceased: barChartData[3]?.value || 0,
        }}
        active="Confirmed"
        onGetCategory={category => console.log(category)}
      />

      <div data-testid="lineChartsContainer">
        <h1>Top Districts</h1>
        {lineChartsData.length > 0 &&
          lineChartsData.map(chart => (
            <LineChartComponent key={chart.label} data={chart.data} />
          ))}
      </div>

      <p data-testid="totalTestedCases">Total Tested: {testedCases}</p>
    </div>
  )
}

export default StateSpecific
