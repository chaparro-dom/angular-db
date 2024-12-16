const { Order, OrderItem, Product, User } = require('../models');
const sequelize = require('../config/database');

const orderController = {
    // Obtener todas las órdenes
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.findAll({
                include: [
                    {
                        model: OrderItem,
                        include: [Product]
                    },
                    {
                        model: User,
                        attributes: ['username', 'email']
                    }
                ]
            });

            return res.status(200).json({
                success: true,
                data: orders
            });
        } catch (error) {
            console.error('Error al obtener órdenes:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener órdenes',
                error: error.message
            });
        }
    },

    // Obtener una orden específica
    getOrderById: async (req, res) => {
        try {
            const { id } = req.params;
            const order = await Order.findOne({
                where: { id },
                include: [
                    {
                        model: OrderItem,
                        include: [Product]
                    },
                    {
                        model: User,
                        attributes: ['username', 'email']
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            console.error('Error al obtener orden:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener orden',
                error: error.message
            });
        }
    },

    // Crear nueva orden
    createOrder: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { userId, items, shippingAddress, paymentMethod } = req.body;

            // Validar items
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe incluir al menos un item en la orden'
                });
            }

            // Calcular total y verificar stock
            let total = 0;
            const orderItems = [];
            
            for (const item of items) {
                const product = await Product.findByPk(item.productId);
                if (!product) {
                    throw new Error(`Producto ${item.productId} no encontrado`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para ${product.name}`);
                }
                
                const subtotal = parseFloat(product.price) * item.quantity;
                total += subtotal;
                
                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                    subtotal
                });

                // Actualizar stock
                await product.update({
                    stock: product.stock - item.quantity
                }, { transaction: t });
            }

            // Crear la orden
            const order = await Order.create({
                userId,
                total,
                shippingAddress,
                paymentMethod,
                status: 'pending'
            }, { transaction: t });

            // Crear los items de la orden
            for (const item of orderItems) {
                await OrderItem.create({
                    ...item,
                    orderId: order.id
                }, { transaction: t });
            }

            await t.commit();

            // Obtener la orden completa con sus items
            const completeOrder = await Order.findOne({
                where: { id: order.id },
                include: [
                    {
                        model: OrderItem,
                        include: [Product]
                    },
                    {
                        model: User,
                        attributes: ['username', 'email']
                    }
                ]
            });

            return res.status(201).json({
                success: true,
                message: 'Orden creada exitosamente',
                data: completeOrder
            });

        } catch (error) {
            await t.rollback();
            console.error('Error al crear orden:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear la orden',
                error: error.message
            });
        }
    },

    // Actualizar estado de orden
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await Order.findByPk(id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            await order.update({ status });

            return res.status(200).json({
                success: true,
                message: 'Estado de orden actualizado exitosamente',
                data: order
            });
        } catch (error) {
            console.error('Error al actualizar estado de orden:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar estado de orden',
                error: error.message
            });
        }
    },

    // Cancelar orden
    cancelOrder: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const order = await Order.findOne({
                where: { id },
                include: [OrderItem]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            if (order.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'La orden ya está cancelada'
                });
            }

            // Devolver stock
            for (const item of order.OrderItems) {
                const product = await Product.findByPk(item.productId);
                await product.update({
                    stock: product.stock + item.quantity
                }, { transaction: t });
            }

            await order.update({ status: 'cancelled' }, { transaction: t });
            await t.commit();

            return res.status(200).json({
                success: true,
                message: 'Orden cancelada exitosamente'
            });

        } catch (error) {
            await t.rollback();
            console.error('Error al cancelar orden:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al cancelar la orden',
                error: error.message
            });
        }
    }
};

module.exports = orderController; 