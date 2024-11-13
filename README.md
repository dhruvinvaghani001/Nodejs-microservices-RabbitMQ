## Node js Microservices (Event-Driven Architecture)

This project involves two microservices: **Admin** and **Main**, each performing different roles but working together in a distributed environment. The Admin service manages products and uses a MySQL database for persistent storage, while the Main service is responsible for the application's core functionality and uses a MongoDB database.

To ensure consistency between these two services and databases, we've implemented an event-driven architecture using RabbitMQ. This allows for seamless synchronization of product data across both microservices whenever a CRUD (Create, Read, Update, Delete) operation occurs in the Admin service. Specifically, when a product is added, updated, or deleted in the Admin service, the corresponding changes are automatically reflected in the Main service.

![image](https://github.com/user-attachments/assets/fb4a5fe5-1944-4187-81e3-cc5ca04d0082)
