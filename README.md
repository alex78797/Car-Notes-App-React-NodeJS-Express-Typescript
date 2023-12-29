# Car Notes Application

* Full-stack application, where car enthusiasts can store their own notes, when deciding to buy a car.

* The project features a role based authorization implemented with JSON Web Tokens (JWTs) access and refresh tokens. Authenticated users can create, retrieve, update or delete their own car notes. An admin has access to all the notes in the database and can delete any one of them.

* Application state is also managed through the URL: when a user checks a checkbox to filter data, the value of the checkbox is appended as query parameter to the URL and the filtered data is retrieved automatically from the server when the URL changes.
