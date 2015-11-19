package main

import (
	"github.com/gin-gonic/gin"
	"github.com/justinas/nosurf"
	"godemo/controller"
	"godemo/database"
	"godemo/model"
	"net/http"
	"os"
)

const defaultPort = "8080"

type Image struct {
	Url string `json:"url" form:"url" bindings:"required"`
}

func main() {
	migrate()

	router := gin.Default()

	router.Static("/css", "./assets/dist/css")
	router.Static("/js", "./assets/js")
	router.Static("/fonts", "./assets/fonts")
	router.LoadHTMLGlob("templates/*")

	router.GET("/", controller.Users.Top)

	router.GET("/proxy", func(c *gin.Context) {
		var img Image
		if c.Bind(&img) == nil {
			c.JSON(http.StatusOK, img)
		}
	})

	http.ListenAndServe(":"+port(), nosurf.New(router))
}

func port() string {
	port := os.Getenv("PORT")
	if len(port) == 0 {
		port = defaultPort
	}

	return port
}

func migrate() {
	db := database.GetDB()

	db.AutoMigrate(&model.User{})
}
