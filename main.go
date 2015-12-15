package main

import (
	"github.com/gin-gonic/gin"
	"github.com/justinas/nosurf"
	"godemo/controller"
	"godemo/database"
	"godemo/model"
	"io/ioutil"
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
	router.Use(noFrame())

	router.Static("/css", "./assets/dist/css")
	router.Static("/js", "./assets/dist/js")
	router.Static("/img", "./assets/dist/img")
	router.Static("/fonts", "./assets/fonts")
	router.LoadHTMLGlob("templates/*")

	router.GET("/", controller.Users.Top)

	router.GET("/proxy", func(c *gin.Context) {
		var img Image
		if c.Bind(&img) != nil {
			return
		}
		if res, err := http.Get(img.Url); err != nil {
			c.AbortWithError(res.StatusCode, err)
		} else if binary, err := ioutil.ReadAll(res.Body); err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
		} else {
			c.Data(http.StatusOK, res.Header.Get("Content-Type"), binary)
			res.Body.Close()
		}
	})

	http.ListenAndServe(":"+port(), nosurf.New(router))
}

// https://developer.mozilla.org/ja/docs/HTTP/X-Frame-Options
func noFrame() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		c.Header("X-Frame-Options", "SAMEORIGIN")
	}
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
