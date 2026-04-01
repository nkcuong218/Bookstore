const BASE_URL = 'https://provinces.open-api.vn/api/v1'

const fetchJson = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}

const vietnamProvincesService = {
  getProvinces: async () => {
    return fetchJson(`${BASE_URL}/?depth=2`)
  },

  getDistrictsByProvinceCode: async (provinceCode) => {
    if (!provinceCode) return []
    return fetchJson(`${BASE_URL}/p/${provinceCode}?depth=2`)
      .then((data) => data?.districts || [])
  },

  getWardsByDistrictCode: async (districtCode) => {
    if (!districtCode) return []
    return fetchJson(`${BASE_URL}/d/${districtCode}?depth=2`)
      .then((data) => data?.wards || [])
  }
}

export default vietnamProvincesService
