export const settingsApi = {

  async getUserPreferences() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem("userPreferences")

        resolve(
          data
            ? JSON.parse(data)
            : {
                notificationsEnabled: true,
                autoRefresh: true,
                dashboardLayout: "grid"
              }
        )
      }, 400)
    })
  },

  async updateUserPreferences(preferences: any) {
    return new Promise((resolve) => {
      setTimeout(() => {

        localStorage.setItem(
          "userPreferences",
          JSON.stringify(preferences)
        )

        resolve(preferences)

      }, 400)
    })
  }

}