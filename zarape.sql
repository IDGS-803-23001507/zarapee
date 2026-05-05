Drop database if exists Zarapeee;

Create database Zarapeee;
use Zarapeee;

Create table Sucursal(
idSucursal int not null auto_increment,
nombre varchar(50) not null,
foto longtext,
ciudad varchar(50) not null,
calle varchar(50) not null,
colonia varchar(50) not null,
numInt varchar(6) not null,
cp varchar(10) not null,
estatus Boolean default 1,
Constraint pk_sucursal primary key (idSucursal)
);

Create table Producto(
idProducto int not null auto_increment,
nombre varchar(50) not null,
descripcion varchar(200) not null,
foto longtext,
precio decimal (10.2),
tipo enum('ALIMENTO','BEBIDA','COMBO'),
estatus Boolean default 1,
Constraint pk_producto primary key (idProducto)
);

Create table Alimento(
idAlimento int not null auto_increment,
idProducto int not null,
Constraint pk_alimento primary key (idAlimento),
Constraint fk_alim_producto foreign key (idProducto) references Producto(idProducto)
);

Create table Bebida(
idBebida int not null auto_increment,
idProducto int not null,
Constraint pk_bebida primary key (idBebida),
Constraint fk_beb_producto foreign key (idProducto) references Producto(idProducto)
);

Create table Combo(
idCombo int not null auto_increment,
idProducto int not null,
Constraint pk_combo primary key (idCombo),
Constraint fk_combo_producto foreign key (idProducto) references Producto(idProducto)
);

Create table DetalleCombo(
idDetalleCombo int not null auto_increment,
idCombo int not null,
idProducto int not null,
cantidad int not null default 1,
Constraint pk_detallecombo primary key (idDetalleCombo),
Constraint fk_detcombo_combo foreign key (idCombo) references Combo(idCombo),
Constraint fk_detcombo_producto foreign key (idProducto) references Producto(idProducto)
);

Create table Rol(
idRol int not null auto_increment,
nombre varchar(30),
Constraint pk_rol primary key (idRol)
);

Create table Usuario(
idUsuario int not null auto_increment,
idRol int not null,
Email varchar(40) not null,
Contrasena varchar(50) not null,
estatus Boolean default 1,
token longtext,
Constraint pk_usuario primary key (idUsuario),
Constraint fk_rol foreign key (idRol) references Rol(idRol) 
);

Create table Empleado(
idEmpleado int not null auto_increment, 
idUsuario int not null,
idSucursal int not null,
nombre varchar(50),
apellidoPa varchar(50),
apellidoMa varchar(50),
telefono varchar(10),
fechaNac date,
Constraint pk_empleado primary key (idEmpleado),
Constraint fk_emp_usuario foreign key (idUsuario) references Usuario(idUsuario), 
Constraint fk_sucursal foreign key (idSucursal) references Sucursal(idSucursal)
); 

Create table Cliente(
idCliente int not null auto_increment, 
idUsuario int not null,
nombre varchar(50) not null,
apellidoPa varchar(50) not null,
apellidoMa varchar(50),
telefono varchar(10) not null,
ciudad varchar(50),
calle varchar(50),
cp varchar(10),
Constraint pk_cliente primary key (idCliente),
Constraint fk_clt_usuario foreign key (idUsuario) references Usuario(idUsuario) 
);