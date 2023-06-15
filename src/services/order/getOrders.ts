import OrderModel, { Order } from '@/models/order';
import { Activity } from '@/models/activity';
import { OrderStatus } from '@/enums/orderStatus';
import { Ticket } from '@/models/ticket';
import { Types } from 'mongoose';
import { SeatReservation } from '@/models/seatReservation';

const getOrders = async ({
  userId,
  status,
  page,
  pageSize,
}: {
  userId: string;
  status: 'completed' | 'unpaid';
  page: number;
  pageSize: number;
}) => {
  const filter = {
    user_id: new Types.ObjectId(userId),
    status:
      status === 'unpaid'
        ? OrderStatus.PENDING
        : { $in: [OrderStatus.SUCCESS, OrderStatus.CANCELLED] },
  };

  let orders: (Order & {
    activity: Activity;
    seats: {
      area_id: Types.ObjectId;
      subarea_id: Types.ObjectId;
      row: number;
      seat: number;
    }[];
  })[];

  if (status === 'unpaid') {
    orders = await OrderModel.aggregate<
      Order & { activity: Activity; seats: SeatReservation['seats'] }
    >([
      { $match: filter },
      {
        $lookup: {
          from: 'activities',
          localField: 'activity_id',
          foreignField: '_id',
          as: 'activities',
        },
      },
      {
        $lookup: {
          from: 'seat_reservations',
          localField: 'seat_reservation_id',
          foreignField: '_id',
          as: 'seat_reservations',
        },
      },
      {
        $addFields: {
          activity: { $first: '$activities' },
          seats: {
            $getField: {
              field: 'seats',
              input: {
                $first: '$seat_reservations',
              },
            },
          },
        },
      },
    ])
      .sort({ create_at: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
  } else {
    orders = await OrderModel.aggregate<
      Order & { activity: Activity; seats: Ticket[] }
    >([
      { $match: filter },
      {
        $lookup: {
          from: 'activities',
          localField: 'activity_id',
          foreignField: '_id',
          as: 'activities',
        },
      },
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'order_id',
          as: 'seats',
        },
      },
      {
        $addFields: {
          activity: { $first: '$activities' },
        },
      },
    ])
      .sort({ create_at: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
  }

  const totalCount = await OrderModel.countDocuments(filter);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const data = orders.map((o) => {
    const { _id, order_no, price, status, activity, seats, create_at } = o;
    const { name, location, address, areas } = activity;
    const event = activity.events.find((e) => e._id?.equals(o.event_id));
    return {
      id: _id,
      orderNo: order_no,
      status,
      price,
      createAt: create_at,
      activity: {
        id: activity._id,
        name,
        location,
        address,
        eventId: event?._id,
        eventStartTime: event?.start_at,
        eventEndTime: event?.end_at,
      },
      seats: seats.map((t) => {
        const subArea = areas
          .find((a) => a._id?.equals(t.area_id))
          ?.subareas.find((sa) => sa._id?.equals(t.subarea_id));
        return {
          subAreaId: t.subarea_id,
          subAreaName: subArea?.name,
          row: t.row,
          seat: t.seat,
        };
      }),
    };
  });

  return { data, page, pageSize, totalPages, totalCount };
};

export default getOrders;
