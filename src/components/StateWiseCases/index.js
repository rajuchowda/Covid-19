import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import StateTotalData from '../StateTotalData'
import ShowEachDistrictData from '../ShowEachDistrictData'
import ChartsData from '../ChartsData'
import './index.css'

const statesList = [
  {state_code: 'AN', state_name: 'Andaman and Nicobar Islands'},
  {state_code: 'AP', state_name: 'Andhra Pradesh'},
  {state_code: 'AR', state_name: 'Arunachal Pradesh'},
  {state_code: 'AS', state_name: 'Assam'},
  {state_code: 'BR', state_name: 'Bihar'},
  {state_code: 'CH', state_name: 'Chandigarh'},
  {state_code: 'CT', state_name: 'Chhattisgarh'},
  {state_code: 'DN', state_name: 'Dadra and Nagar Haveli and Daman and Diu'},
  {state_code: 'DL', state_name: 'Delhi'},
  {state_code: 'GA', state_name: 'Goa'},
  {state_code: 'GJ', state_name: 'Gujarat'},
  {state_code: 'HR', state_name: 'Haryana'},
  {state_code: 'HP', state_name: 'Himachal Pradesh'},
  {state_code: 'JK', state_name: 'Jammu and Kashmir'},
  {state_code: 'JH', state_name: 'Jharkhand'},
  {state_code: 'KA', state_name: 'Karnataka'},
  {state_code: 'KL', state_name: 'Kerala'},
  {state_code: 'LA', state_name: 'Ladakh'},
  {state_code: 'LD', state_name: 'Lakshadweep'},
  {state_code: 'MH', state_name: 'Maharashtra'},
  {state_code: 'MP', state_name: 'Madhya Pradesh'},
  {state_code: 'MN', state_name: 'Manipur'},
  {state_code: 'ML', state_name: 'Meghalaya'},
  {state_code: 'MZ', state_name: 'Mizoram'},
  {state_code: 'NL', state_name: 'Nagaland'},
  {state_code: 'OR', state_name: 'Odisha'},
  {state_code: 'PY', state_name: 'Puducherry'},
  {state_code: 'PB', state_name: 'Punjab'},
  {state_code: 'RJ', state_name: 'Rajasthan'},
  {state_code: 'SK', state_name: 'Sikkim'},
  {state_code: 'TN', state_name: 'Tamil Nadu'},
  {state_code: 'TG', state_name: 'Telangana'},
  {state_code: 'TR', state_name: 'Tripura'},
  {state_code: 'UP', state_name: 'Uttar Pradesh'},
  {state_code: 'UT', state_name: 'Uttarakhand'},
  {state_code: 'WB', state_name: 'West Bengal'},
]

class StateWiseCases extends Component {
  state = {
    eachStateTotalData: {},
    isLoading: true,
    totalTestedData: 0,
    nameOfState: '',
    activeTab: true,
    category: 'Confirmed',
    dataarray: {},
    stateCode: '',
    date: '',
  }

  componentDidMount() {
    this.getAllStateData()
  }

  getAllStateData = async () => {
    const {match} = this.props
    const stateCodeParam = match.params.stateCode.toUpperCase()
    const apiUrl = 'https://apis.ccbp.in/covid19-state-wise-data/'
    const response = await fetch(apiUrl)

    if (response.ok) {
      const data = await response.json()
      const stateData = data[stateCodeParam]?.total || {}
      const stateTestedData = stateData.tested || 0
      const stateNameObj = statesList.find(each => each.state_code === stateCodeParam)
      const stateName = stateNameObj?.state_name || ''
      const lastUpdated = data[stateCodeParam]?.meta?.last_updated 
        ? new Date(data[stateCodeParam].meta.last_updated)
        : new Date()

      this.setState({
        eachStateTotalData: stateData,
        totalTestedData: stateTestedData,
        nameOfState: stateName,
        isLoading: false,
        dataarray: data,
        stateCode: stateCodeParam,
        date: lastUpdated.toDateString(),
      })
    }
  }

  onGetCategory = categoryVal => {
    this.setState({category: categoryVal, activeTab: false})
  }

  getCategoryWiseData = () => {
    const {category, stateCode, dataarray} = this.state
    const districtOutput = dataarray[stateCode]?.districts || {}
    const distNamesList = Object.keys(districtOutput)
    const categoryLower = category.toLowerCase()

    const categoryData = distNamesList.map(element => ({
      distName: element,
      value: districtOutput[element]?.total?.[categoryLower] || 0,
    }))

    const activeCases = distNamesList.map(element => ({
      distName: element,
      value:
        (districtOutput[element]?.total?.confirmed || 0) -
        ((districtOutput[element]?.total?.recovered || 0) +
          (districtOutput[element]?.total?.deceased || 0)),
    }))

    if (categoryLower === 'active')
      return activeCases.sort((a, b) => b.value - a.value)
    return categoryData.sort((a, b) => b.value - a.value)
  }

  renderLoadingView = () => (
    <div
      className="products-details-loader-container"
      testid="stateDetailsLoader"
    >
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderStateView = () => {
    const {
      nameOfState,
      totalTestedData,
      eachStateTotalData,
      activeTab,
      date,
      category,
      stateCode,
    } = this.state
    const catdata = this.getCategoryWiseData()

    return (
      <div className="state-details">
        <div className="state-name-row">
          <h1 className="state-name-container">{nameOfState}</h1>
          <div className="testno-container">
            <p className="test-title">Tested</p>
            <p className="testno">{totalTestedData}</p>
          </div>
        </div>
        <p className="last-date">{`last update on ${date}`}</p>

        <StateTotalData
          onGetCategory={this.onGetCategory}
          eachStateTotalData={eachStateTotalData}
          active={activeTab}
        />

        <h1 className={`district-heading ${category}-color`}>Top Districts</h1>
        <ul className="districts-container" testid="topDistrictsUnorderedList">
          {catdata.map(each => (
            <ShowEachDistrictData
              key={each.distName}
              name={each.distName}
              number={each.value}
            />
          ))}
        </ul>

        {/* Ensure only one unique testid in the entire app */}
        <div className="graphs-data" testid="lineChartsContainer">
          <ChartsData stateCode={stateCode} category={category} />
        </div>
      </div>
    )
  }

  render() {
    const {isLoading} = this.state
    return (
      <div className="main-container">
        <Header />
        <div className="container">
          {isLoading ? this.renderLoadingView() : this.renderStateView()}
        </div>
      </div>
    )
  }
}

export default StateWiseCases
