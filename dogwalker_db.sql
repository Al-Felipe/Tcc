create database if not exists dogwalker_db
default character set utf8mb4
default collate utf8mb4_unicode_ci;

use dogwalker_db;

/* create table if not exists usuarios (
	id int not null auto_increment primary key,
    nome varchar(150) not null,
    email varchar(150) not null unique,
    senha varchar(255) not null,
    tipo enum('usuario', 'dogwalker') not null default 'usuario'
)default charset = utf8mb4; */

/*DELETE FROM Dogwalker;
DELETE FROM Cliente;
DELETE FROM Usuario;*/

select * from usuarios;



