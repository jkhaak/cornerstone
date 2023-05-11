CREATE TABLE public.ruuvitag (
	id varchar(4) NOT NULL,
	mac varchar(12) NOT NULL,
	display_name varchar(64) NULL,
	CONSTRAINT ruuvitag_pk PRIMARY KEY (id)
);

CREATE TABLE public.ruuvidata (
	id bigserial NOT NULL,
	ruuvitag varchar(4) NOT NULL,
	"version" smallint NOT NULL,
	datetime timestamp with time zone NOT NULL,
	temperature real NULL,
	humidity real NULL,
	pressure integer NULL,
	acceleration_x real NULL,
	acceleration_y real NULL,
	acceleration_z real NULL,
	power_voltage real NULL,
	power_tx smallint NULL,
	movement_counter smallint NULL,
	measurement_sequence integer NULL,
	CONSTRAINT ruuvidata_pk PRIMARY KEY (id),
	CONSTRAINT ruuvidata_fk FOREIGN KEY (ruuvitag) REFERENCES public.ruuvitag(id) ON DELETE SET NULL ON UPDATE CASCADE
);
