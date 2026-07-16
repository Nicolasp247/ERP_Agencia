/* backend/src/modules/expediente/confirmacion-builder/repository/confirmacion-builder.repository.ts */

import type {
  ConfirmacionBuilderCreateInput,
  ConfirmacionBuilderFreeNotesInput,
  ConfirmacionBuilderHotelPreviewInput,
  ConfirmacionBuilderMoveItemInput,
  ConfirmacionBuilderItemInput,
  ConfirmacionBuilderNoteInput,
  ConfirmacionBuilderPurchaseInput,
  ConfirmacionBuilderPriceInput,
  ConfirmacionPassengerInput
} from "@/modules/expediente/confirmacion-builder/dto/confirmacion-builder.dto";
import { confirmacionBuilderCreateRepository } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder-create.repository";
import { confirmacionBuilderItemsRepository } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder-items.repository";
import { confirmacionBuilderLifecycleRepository } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder-lifecycle.repository";
import { confirmacionBuilderPassengersRepository } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder-passengers.repository";
import { confirmacionBuilderReadRepository } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder-read.repository";
import { confirmacionBuilderPurchasesRepository } from "@/modules/expediente/confirmacion-builder/repository/confirmacion-builder-purchases.repository";

export class ConfirmacionBuilderRepository {
  createItem(
    reservaId: number,
    data: ConfirmacionBuilderItemInput,
    userId?: number | null
  ) {
    return confirmacionBuilderItemsRepository.createItem(
      reservaId,
      data,
      userId
    );
  }
  
  upsertItemPurchase(
    itemId: number,
    data: ConfirmacionBuilderPurchaseInput,
    userId?: number | null
  ) {
    return confirmacionBuilderPurchasesRepository.upsertItemPurchase(
      itemId,
      data,
      userId
    );
  }

  findOptionsByVersionId(versionId: number) {
    return confirmacionBuilderReadRepository.findOptionsByVersionId(
      versionId
    );
  }

  findByVersionId(versionId: number) {
    return confirmacionBuilderReadRepository.findByVersionId(
      versionId
    );
  }

  createFromAcceptedCotizacion(
    versionId: number,
    data: ConfirmacionBuilderCreateInput,
    userId?: number | null
  ) {
    return confirmacionBuilderCreateRepository.createFromAcceptedCotizacion(
      versionId,
      data,
      userId
    );
  }

  createPassenger(
    reservaId: number,
    data: ConfirmacionPassengerInput,
    userId?: number | null
  ) {
    return confirmacionBuilderPassengersRepository.createPassenger(
      reservaId,
      data,
      userId
    );
  }

  updatePassenger(
    passengerId: number,
    data: ConfirmacionPassengerInput,
    userId?: number | null
  ) {
    return confirmacionBuilderPassengersRepository.updatePassenger(
      passengerId,
      data,
      userId
    );
  }

  deletePassenger(passengerId: number) {
    return confirmacionBuilderPassengersRepository.deletePassenger(
      passengerId
    );
  }

  updateItemPrices(
    itemId: number,
    data: ConfirmacionBuilderPriceInput
  ) {
    return confirmacionBuilderItemsRepository.updateItemPrices(
      itemId,
      data
    );
  }

  updateItemNotes(
    itemId: number,
    data: ConfirmacionBuilderNoteInput
  ) {
    return confirmacionBuilderItemsRepository.updateItemNotes(
      itemId,
      data
    );
  }

  updateItemHotels(
    itemId: number,
    data: ConfirmacionBuilderHotelPreviewInput
  ) {
    return confirmacionBuilderItemsRepository.updateItemHotels(
      itemId,
      data
    );
  }

  moveItem(
    itemId: number,
    data: ConfirmacionBuilderMoveItemInput
  ) {
    return confirmacionBuilderItemsRepository.moveItem(
      itemId,
      data
    );
  }

  deleteItem(itemId: number) {
    return confirmacionBuilderItemsRepository.deleteItem(itemId);
  }

  updateFreeNotes(
    versionId: number,
    data: ConfirmacionBuilderFreeNotesInput
  ) {
    return confirmacionBuilderLifecycleRepository.updateFreeNotes(
      versionId,
      data
    );
  }

  deleteByVersionId(
    versionId: number,
    userId?: number | null
  ) {
    return confirmacionBuilderLifecycleRepository.deleteByVersionId(
      versionId,
      userId
    );
  }
}

export const confirmacionBuilderRepository =
  new ConfirmacionBuilderRepository();