import React, { useMemo, useState } from 'react';
import { withRouter, Link } from 'react-router-dom';
import accounting from 'accounting';

import Checkbox from './Checkbox';

import edit from '../img/edit.svg';
import './place.css';


const Basket = ({ match: { params: { areaId, itemId }}, foodAreas, order, settings, updateSettings }) => {
    const [ faster, setFaster ] = useState(!!settings.faster || !settings.time);
    const [ time, setTime ] = useState(!settings.time || faster ? "" : settings.time);
    const [ selfService, setSelfService ] = useState(settings.selfService === null ? false : settings.selfService);
    const area = foodAreas.filter(area => area.id === areaId)[0];
    const item = area.items.filter(item => item.id === itemId)[0];

    const [ price, products ] = useMemo(() => {
        const foodIds = new Set((item.foods || []).map(item => item.id));

        const products = Object.values(order)
            .filter((value) => {
                const { item: { id }} = value;

                return foodIds.has(id);
            });

        const result = products.reduce((result, value) => {
            const { count, item } = value;

            return result + parseInt(item.price) * parseInt(count);
        }, 0);

        return [ accounting.formatNumber(result, 0, ' '), products ];
    }, [ order, item ]);

    const handleTimeChange = (value) => {

        // Если предыдущее значение было формата "hh", то подставляем ":"
        if (value.length === 3 && time.length === 2) {
            value = value.substring(0,2) + ":" + value[2];
        }

        if (isValidTime(value, true)) {
            // Если ввели часы - подставляем ":". Проверяем вводим данные или стираем.
            if (value.length === 2 && time.length < value.length) {
                setTime(value + ":")
            } else {
                setTime(value);
            }
        } else {
            if (value.length === 0) setTime('');
        }
    }

    const isValidTime = (timeValue, onInputChange) => {
        var validationExpression = /^(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[0-5][0-9])$/;

        if (onInputChange) {
            switch (timeValue.length) {
                case 0:
                    return false;
                case 1:
                    validationExpression = /^[0-2]$/;
                    break;
                case 2:
                    validationExpression = /^(0[0-9]|1[0-9]|2[0-3])$/;
                    break;
                case 3:
                    validationExpression = /^(0[0-9]|1[0-9]|2[0-3]):$/;
                    break;
                case 4:
                    validationExpression = /^(0[0-9]|1[0-9]|2[0-3]):([0-5])$/;
                    break;
                case 5:
                    validationExpression = /^(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[0-5][0-9])$/;
                    break;
                default:
                    break;
            }
        }

        return validationExpression.test(timeValue);
    }

    // Проверяем заказ. Выбраны ли товары, параметры доставки. Используется в рендере кнопки заказа.
    const isValidOrder = () => {
        return products.length !== 0 && (isValidTime(time, false) || faster);
    }

    return (
        <div className="Place">
            <header className="Place__header">
                <aside className="Place__trz">
                    <h1 className="Place__head">
                        <Link to="/" className="Place__logo">
                            {area.name}
                        </Link>
                    </h1>
                    <Link to="/edit" className="Place__change-tz">
                        <img
                            alt="change-profile"
                            src={edit}
                        />
                    </Link>
                </aside>
            </header>
            <aside className="Place__restoraunt">
                <img
                    className="Place__restoraunt-logo"
                    alt="Fastfood logo"
                    src={item.image}
                />
                <h2
                    className="Place__restoraunt-name"
                >
                    {item.name}
                </h2>
                <p className="Place__restoraunt-type">
                    {item.description}
                </p>
            </aside>
            <div className="Place__products-wrapper">
                <ul className="Place__products">
                    {products.map(({ item, count }) => (
                        <li
                            className="Place__product"
                            key={item.id}
                        >
                            <img
                                className="Place__product-logo"
                                alt="Ordered product logo"
                                src={item.image}
                            />
                            <h3
                                className="Place__product-name"
                            >
                                {item.name}
                            </h3>
                            <p
                                className="Place__product-price"
                            >
                                Цена: {item.price}
                            </p>
                            <p
                                className="Place__product-count"
                            >
                                x{count}
                            </p>
                        </li>
                    ))}
                </ul>
                <Link
                    className="Place__change-product"
                    to={`/place/${areaId}/${itemId}`}
                    onClick={() => {
                        updateSettings({faster: faster, time: time, selfService: selfService})
                    }}
                >
                    Изменить
                </Link>
            </div>
            <div className="Place__choice">
                <h3>Время:</h3>
                <div className="Place__choice-item">
                    <span>Как можно быстрее</span>
                    <Checkbox
                        checked={faster}
                        value={faster}
                        onToggle={() => {
                            if (faster) {
                                setFaster(false);
                            } else {
                                setTime('');
                                setFaster(true);
                            }
                        }}
                    />
                </div>
                <div className="Place__choice-item">
                    <span>Назначить</span>
                    <input
                        value={time}
                        onFocus={() => {
                            setFaster(false);
                        }}
                        onChange={event => {
                            setFaster(false);
                            handleTimeChange(event.target.value);
                            //setTime(event.target.value);
                        }}
                        onBlur={() => {
                            if (time) {
                                setFaster(false);
                            }
                        }}
                        type="time"
                    />
                </div>
                <div className="Place__choice-item">
                    <h3>С собой</h3>
                    <Checkbox checked={selfService} onToggle={() => setSelfService(!selfService)} />
                </div>
                <div className="Place__choice-item">
                    <h3>На месте</h3>
                    <Checkbox checked={!selfService} onToggle={() => setSelfService(!setSelfService)} />
                </div>
            </div>
            <footer className="Place__footer">
                <Link to={`/order/${area.id}/${item.id}`} className={isValidOrder() ? "Place__order" : "Place__order_disabled"} onClick={ (event) => {if (!isValidOrder()) {event.preventDefault()} else { updateSettings({faster: faster, time: time, selfService: selfService}) }} }>
                    {
                        isValidOrder() ? "Оплатить " + price : (products.length === 0 ? "Корзина пустая" : "Выберите время доставки")
                    }
                </Link>
            </footer>
        </div>
    );
};

export default withRouter(Basket);
